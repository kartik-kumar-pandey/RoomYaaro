import prisma from '../config/db.js';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/helpers.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or account disabled.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token.', 401));
    }
    next(error);
  }
};

export const authorizeOwner = (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return next(new AppError('Access denied. Owner only.', 403));
  }
  next();
};

export const authorizeTenant = (req, res, next) => {
  if (req.user.role !== 'TENANT') {
    return next(new AppError('Access denied. Tenant only.', 403));
  }
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Access denied. Admin only.', 403));
  }
  next();
};

export const authorizeOwnerOrAdmin = (req, res, next) => {
  if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
    return next(new AppError('Access denied.', 403));
  }
  next();
};
