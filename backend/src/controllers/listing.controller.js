import { body } from 'express-validator';
import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/upload.service.js';

export const createListingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('rent').isFloat({ min: 1 }).withMessage('Rent must be greater than 0'),
  body('availableFrom').isISO8601().withMessage('Valid available date is required'),
  body('roomType').isIn(['SINGLE', 'DOUBLE', 'SHARED', 'STUDIO', 'ENTIRE_FLAT']),
  body('furnishingStatus').isIn(['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED']),
  body('description').trim().notEmpty().withMessage('Description is required'),
];

export const getListings = asyncHandler(async (req, res) => {
  const {
    location,
    minRent,
    maxRent,
    roomType,
    furnishing,
    keyword,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const where = {
    status: 'AVAILABLE',
    isDeleted: false,
    ...(location && { location: { contains: location, mode: 'insensitive' } }),
    ...(minRent && { rent: { gte: parseFloat(minRent) } }),
    ...(maxRent && { rent: { ...(minRent ? { gte: parseFloat(minRent) } : {}), lte: parseFloat(maxRent) } }),
    ...(roomType && { roomType }),
    ...(furnishing && { furnishingStatus: furnishing }),
    ...(keyword && {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { location: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ],
    }),
  };

  const orderBy = {
    'rent-low': { rent: 'asc' },
    'rent-high': { rent: 'desc' },
    newest: { createdAt: 'desc' },
  }[sort] || { createdAt: 'desc' };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [listings, total] = await Promise.all([
    prisma.roomListing.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      include: {
        photos: { orderBy: { order: 'asc' } },
        owner: { select: { id: true, name: true } },
      },
    }),
    prisma.roomListing.count({ where }),
  ]);

  sendSuccess(res, {
    listings,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export const getListingById = asyncHandler(async (req, res) => {
  const listing = await prisma.roomListing.findFirst({
    where: { id: req.params.id, isDeleted: false },
    include: {
      photos: { orderBy: { order: 'asc' } },
      owner: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!listing) throw new AppError('Listing not found', 404);
  sendSuccess(res, listing);
});

export const createListing = asyncHandler(async (req, res) => {
  const { title, location, rent, availableFrom, roomType, furnishingStatus, description } = req.body;

  const listing = await prisma.roomListing.create({
    data: {
      ownerId: req.user.id,
      title,
      location,
      rent: parseFloat(rent),
      availableFrom: new Date(availableFrom),
      roomType,
      furnishingStatus,
      description,
    },
  });

  if (req.files?.length) {
    const photoPromises = req.files.map(async (file, index) => {
      const result = await uploadToCloudinary(file.buffer);
      return prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          url: result.secure_url,
          publicId: result.public_id,
          order: index,
        },
      });
    });
    await Promise.all(photoPromises);
  }

  const fullListing = await prisma.roomListing.findUnique({
    where: { id: listing.id },
    include: { photos: true },
  });

  sendSuccess(res, fullListing, 'Listing created', 201);
});

export const updateListing = asyncHandler(async (req, res) => {
  const listing = await prisma.roomListing.findFirst({
    where: { id: req.params.id, ownerId: req.user.id, isDeleted: false },
  });

  if (!listing) throw new AppError('Listing not found', 404);

  const { title, location, rent, availableFrom, roomType, furnishingStatus, description } = req.body;

  const updated = await prisma.roomListing.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(location && { location }),
      ...(rent && { rent: parseFloat(rent) }),
      ...(availableFrom && { availableFrom: new Date(availableFrom) }),
      ...(roomType && { roomType }),
      ...(furnishingStatus && { furnishingStatus }),
      ...(description && { description }),
    },
    include: { photos: true },
  });

  if (req.files?.length) {
    const existingCount = updated.photos.length;
    const photoPromises = req.files.map(async (file, index) => {
      const result = await uploadToCloudinary(file.buffer);
      return prisma.listingPhoto.create({
        data: {
          listingId: updated.id,
          url: result.secure_url,
          publicId: result.public_id,
          order: existingCount + index,
        },
      });
    });
    await Promise.all(photoPromises);
  }

  const fullListing = await prisma.roomListing.findUnique({
    where: { id: updated.id },
    include: { photos: true },
  });

  sendSuccess(res, fullListing, 'Listing updated');
});

export const deleteListing = asyncHandler(async (req, res) => {
  const listing = await prisma.roomListing.findFirst({
    where: { id: req.params.id, ownerId: req.user.id, isDeleted: false },
    include: { photos: true },
  });

  if (!listing) throw new AppError('Listing not found', 404);

  await prisma.roomListing.update({
    where: { id: req.params.id },
    data: { isDeleted: true },
  });

  sendSuccess(res, null, 'Listing deleted');
});

export const markListingFilled = asyncHandler(async (req, res) => {
  const listing = await prisma.roomListing.findFirst({
    where: { id: req.params.id, ownerId: req.user.id, isDeleted: false },
  });

  if (!listing) throw new AppError('Listing not found', 404);

  const updated = await prisma.roomListing.update({
    where: { id: req.params.id },
    data: { status: 'FILLED' },
  });

  sendSuccess(res, updated, 'Listing marked as filled');
});

export const getOwnerDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const [totalListings, availableRooms, filledRooms, pendingInterests, acceptedRequests] =
    await Promise.all([
      prisma.roomListing.count({ where: { ownerId, isDeleted: false } }),
      prisma.roomListing.count({ where: { ownerId, status: 'AVAILABLE', isDeleted: false } }),
      prisma.roomListing.count({ where: { ownerId, status: 'FILLED', isDeleted: false } }),
      prisma.interestRequest.count({
        where: { listing: { ownerId }, status: 'PENDING' },
      }),
      prisma.interestRequest.count({
        where: { listing: { ownerId }, status: 'ACCEPTED' },
      }),
    ]);

  sendSuccess(res, {
    totalListings,
    availableRooms,
    filledRooms,
    pendingInterests,
    acceptedRequests,
  });
});

export const getOwnerListings = asyncHandler(async (req, res) => {
  const listings = await prisma.roomListing.findMany({
    where: { ownerId: req.user.id, isDeleted: false },
    include: {
      photos: { orderBy: { order: 'asc' }, take: 1 },
      _count: { select: { interestRequests: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, listings);
});
