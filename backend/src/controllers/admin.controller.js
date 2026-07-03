import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    owners,
    tenants,
    totalListings,
    filledListings,
    totalMessages,
    totalRequests,
    avgScore,
    dailyRegistrations,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
    prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.count({ where: { role: 'TENANT' } }),
    prisma.roomListing.count({ where: { isDeleted: false } }),
    prisma.roomListing.count({ where: { status: 'FILLED', isDeleted: false } }),
    prisma.chatMessage.count(),
    prisma.interestRequest.count(),
    prisma.compatibilityScore.aggregate({ _avg: { score: true } }),
    prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  sendSuccess(res, {
    totalUsers,
    owners,
    tenants,
    totalListings,
    filledListings,
    totalMessages,
    totalRequests,
    averageScore: Math.round(avgScore._avg.score || 0),
    dailyRegistrations,
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 100) : undefined;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

  const where = {
    ...(role && { role }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  sendSuccess(res, { users, total, page, pages: Math.ceil(total / limit) });
});

export const deleteAdminUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot delete admin user', 403);

  await prisma.user.delete({ where: { id: req.params.id } });
  sendSuccess(res, null, 'User deleted');
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot disable admin user', 403);

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive: !user.isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });

  sendSuccess(res, updated, updated.isActive ? 'User enabled' : 'User disabled');
});

export const getAdminListings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 100) : undefined;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    prisma.roomListing.findMany({
      where,
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        photos: { take: 1 },
        _count: { select: { interestRequests: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.roomListing.count({ where }),
  ]);

  sendSuccess(res, { listings, total, page, pages: Math.ceil(total / limit) });
});

export const deleteAdminListing = asyncHandler(async (req, res) => {
  const listing = await prisma.roomListing.findUnique({ where: { id: req.params.id } });
  if (!listing) throw new AppError('Listing not found', 404);

  await prisma.roomListing.update({
    where: { id: req.params.id },
    data: { isDeleted: true },
  });

  sendSuccess(res, null, 'Listing deleted');
});

export const adminMarkListingFilled = asyncHandler(async (req, res) => {
  const updated = await prisma.roomListing.update({
    where: { id: req.params.id },
    data: { status: 'FILLED' },
  });

  sendSuccess(res, updated, 'Listing marked as filled');
});
