import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
import { getOrCreateCompatibilityScore } from '../services/compatibility.service.js';

export const getCompatibility = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!profile) throw new AppError('Complete your tenant profile first', 400);

  const listing = await prisma.roomListing.findFirst({
    where: { id: req.params.listingId, isDeleted: false },
  });

  if (!listing) throw new AppError('Listing not found', 404);

  const score = await getOrCreateCompatibilityScore(profile.id, listing.id);
  sendSuccess(res, score);
});
