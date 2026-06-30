import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
import {
  notifyHighMatch,
  notifyInterestAccepted,
  notifyInterestRejected,
} from '../services/email.service.js';
import { getOrCreateCompatibilityScore } from '../services/compatibility.service.js';

export const createInterest = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await prisma.roomListing.findFirst({
    where: { id: listingId, isDeleted: false },
    include: { owner: true },
  });

  if (!listing) throw new AppError('Listing not found', 404);
  if (listing.status === 'FILLED') throw new AppError('Listing is already filled', 400);

  const existing = await prisma.interestRequest.findUnique({
    where: { tenantId_listingId: { tenantId: req.user.id, listingId } },
  });

  if (existing) throw new AppError('You have already expressed interest in this listing', 409);

  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
  });

  const interest = await prisma.interestRequest.create({
    data: { tenantId: req.user.id, listingId },
    include: {
      listing: { include: { photos: { take: 1 } } },
    },
  });

  if (profile) {
    const score = await getOrCreateCompatibilityScore(profile.id, listingId);
    if (score.score > 80) {
      await notifyHighMatch(listing.owner, req.user, listing, score.score);
    }
  }

  sendSuccess(res, interest, 'Interest submitted', 201);
});

export const acceptInterest = asyncHandler(async (req, res) => {
  const interest = await prisma.interestRequest.findUnique({
    where: { id: req.params.id },
    include: {
      listing: true,
      tenant: true,
    },
  });

  if (!interest) throw new AppError('Interest request not found', 404);
  if (interest.listing.ownerId !== req.user.id) throw new AppError('Access denied', 403);
  if (interest.status !== 'PENDING') throw new AppError('Request already processed', 400);

  const [updated] = await prisma.$transaction([
    prisma.interestRequest.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED' },
    }),
    prisma.chatRoom.create({
      data: {
        interestId: req.params.id,
        listingId: interest.listingId,
      },
    }),
  ]);

  await notifyInterestAccepted(interest.tenant, interest.listing);
  sendSuccess(res, updated, 'Interest accepted');
});

export const rejectInterest = asyncHandler(async (req, res) => {
  const interest = await prisma.interestRequest.findUnique({
    where: { id: req.params.id },
    include: { listing: true, tenant: true },
  });

  if (!interest) throw new AppError('Interest request not found', 404);
  if (interest.listing.ownerId !== req.user.id) throw new AppError('Access denied', 403);
  if (interest.status !== 'PENDING') throw new AppError('Request already processed', 400);

  const updated = await prisma.interestRequest.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED' },
  });

  await notifyInterestRejected(interest.tenant, interest.listing);
  sendSuccess(res, updated, 'Interest rejected');
});

export const getOwnerInterests = asyncHandler(async (req, res) => {
  const interests = await prisma.interestRequest.findMany({
    where: { listing: { ownerId: req.user.id } },
    include: {
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      listing: { select: { id: true, title: true, location: true, rent: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const enriched = await Promise.all(
    interests.map(async (interest) => {
      const profile = await prisma.tenantProfile.findUnique({
        where: { userId: interest.tenantId },
      });

      let compatibility = null;
      if (profile) {
        compatibility = await getOrCreateCompatibilityScore(profile.id, interest.listingId);
      }

      return { ...interest, compatibility };
    })
  );

  sendSuccess(res, enriched);
});

export const getTenantInterests = asyncHandler(async (req, res) => {
  const interests = await prisma.interestRequest.findMany({
    where: { tenantId: req.user.id },
    include: {
      listing: { include: { photos: { take: 1 }, owner: { select: { id: true, name: true } } } },
      chatRoom: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  sendSuccess(res, interests);
});
