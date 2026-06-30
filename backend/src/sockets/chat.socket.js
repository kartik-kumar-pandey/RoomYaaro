import prisma from '../config/db.js';

export const setupSocketHandlers = (io) => {
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, name: true, role: true },
      });

      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.user.id, socket.id);
    io.emit('user-online', { userId: socket.user.id, name: socket.user.name });

    socket.on('join-room', async ({ roomId }) => {
      try {
        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: {
            interest: { include: { listing: true } },
          },
        });

        if (!room || room.interest.status !== 'ACCEPTED') {
          socket.emit('error', { message: 'Cannot join this room' });
          return;
        }

        const { tenantId, listing } = room.interest;
        if (socket.user.id !== tenantId && socket.user.id !== listing.ownerId) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(roomId);
        socket.emit('joined-room', { roomId });
      } catch {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave-room', ({ roomId }) => {
      socket.leave(roomId);
    });

    socket.on('send-message', async ({ roomId, content }) => {
      try {
        if (!content?.trim()) return;

        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: { interest: { include: { listing: true } } },
        });

        if (!room || room.interest.status !== 'ACCEPTED') return;

        const { tenantId, listing } = room.interest;
        if (socket.user.id !== tenantId && socket.user.id !== listing.ownerId) return;

        const message = await prisma.chatMessage.create({
          data: { roomId, senderId: socket.user.id, content: content.trim() },
          include: { sender: { select: { id: true, name: true } } },
        });

        io.to(roomId).emit('receive-message', message);
      } catch {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('typing', {
        userId: socket.user.id,
        name: socket.user.name,
        isTyping,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user.id);
      io.emit('user-offline', { userId: socket.user.id });
    });
  });
};
