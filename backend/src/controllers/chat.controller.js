import prisma from '../config/db.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const getChatMessages = asyncHandler(async (req, res) => {
  const room = await prisma.chatRoom.findUnique({
    where: { id: req.params.roomId },
    include: {
      interest: {
        include: {
          tenant: { select: { id: true, name: true } },
          listing: { include: { owner: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  if (!room) throw new AppError('Chat room not found', 404);

  const { tenantId, listing } = room.interest;
  const ownerId = listing.owner.id;

  if (req.user.id !== tenantId && req.user.id !== ownerId && req.user.role !== 'ADMIN') {
    throw new AppError('Access denied', 403);
  }

  if (room.interest.status !== 'ACCEPTED') {
    throw new AppError('Chat is only available for accepted requests', 403);
  }

  const messages = await prisma.chatMessage.findMany({
    where: { roomId: req.params.roomId },
    include: { sender: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, { room, messages });
});

export const getUserChatRooms = asyncHandler(async (req, res) => {
  let rooms;

  if (req.user.role === 'TENANT') {
    rooms = await prisma.chatRoom.findMany({
      where: { interest: { tenantId: req.user.id, status: 'ACCEPTED' } },
      include: {
        listing: { include: { photos: { take: 1 } } },
        interest: { include: { tenant: { select: { id: true, name: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  } else if (req.user.role === 'OWNER') {
    rooms = await prisma.chatRoom.findMany({
      where: { listing: { ownerId: req.user.id }, interest: { status: 'ACCEPTED' } },
      include: {
        listing: { include: { photos: { take: 1 } } },
        interest: { include: { tenant: { select: { id: true, name: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  } else {
    rooms = [];
  }

  sendSuccess(res, rooms);
});
