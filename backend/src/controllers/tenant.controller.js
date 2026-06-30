import { body } from 'express-validator';
import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
import { getRecommendations } from '../services/compatibility.service.js';

export const profileValidation = [
  body('preferredLocation').optional().trim(),
  body('minBudget').optional().isFloat({ min: 0 }),
  body('maxBudget').optional().isFloat({ min: 0 }),
  body('moveInDate').optional().isISO8601(),
];

export const getTenantProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!profile) throw new AppError('Tenant profile not found', 404);
  sendSuccess(res, profile);
});

export const updateTenantProfile = asyncHandler(async (req, res) => {
  const { preferredLocation, minBudget, maxBudget, moveInDate } = req.body;

  const profile = await prisma.tenantProfile.update({
    where: { userId: req.user.id },
    data: {
      ...(preferredLocation !== undefined && { preferredLocation }),
      ...(minBudget !== undefined && { minBudget: parseFloat(minBudget) }),
      ...(maxBudget !== undefined && { maxBudget: parseFloat(maxBudget) }),
      ...(moveInDate !== undefined && { moveInDate: moveInDate ? new Date(moveInDate) : null }),
    },
  });

  sendSuccess(res, profile, 'Profile updated');
});

export const getTenantDashboard = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!profile) throw new AppError('Tenant profile not found', 404);

  const [recommendations, latestListings, pendingRequests, acceptedRequests] = await Promise.all([
    getRecommendations(profile.id, 6),
    prisma.roomListing.findMany({
      where: { status: 'AVAILABLE', isDeleted: false },
      include: { photos: { orderBy: { order: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.interestRequest.findMany({
      where: { tenantId: req.user.id, status: 'PENDING' },
      include: {
        listing: { include: { photos: { take: 1 } } },
      },
    }),
    prisma.interestRequest.findMany({
      where: { tenantId: req.user.id, status: 'ACCEPTED' },
      include: {
        listing: { include: { photos: { take: 1 } } },
        chatRoom: true,
      },
    }),
  ]);

  sendSuccess(res, {
    recommendations,
    latestListings,
    pendingRequests,
    acceptedRequests,
  });
});

export const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!profile) throw new AppError('Complete your profile first', 400);

  const limit = parseInt(req.query.limit) || 10;
  const recommendations = await getRecommendations(profile.id, limit);

  sendSuccess(res, recommendations);
});
