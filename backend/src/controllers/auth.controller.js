import { body } from 'express-validator';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional({ values: 'falsy' }).trim().isMobilePhone().withMessage('Invalid phone number'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('role').isIn(['OWNER', 'TENANT']).withMessage('Role must be OWNER or TENANT'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
];

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 409);

  const hashedPassword = await hashPassword(password);

  // Generate a secure email verification token (hex, 64 chars)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      emailVerifyToken: rawToken,
      emailVerifyExpiry: verifyExpiry,
      ...(role === 'TENANT' && {
        tenantProfile: { create: {} },
      }),
    },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });

  // Send verification email (non-blocking on failure)
  try {
    sendVerificationEmail(user, rawToken);
  } catch (emailErr) {
    logger.warn('Failed to send verification email after register', { userId: user.id, error: emailErr.message });
  }

  logger.auth('register', { userId: user.id, email: user.email, role: user.role, ip: req.ip });

  const token = generateToken(user.id, user.role);
  sendSuccess(
    res,
    {
      user,
      token,
      message: 'Please check your email to verify your account.',
    },
    'Registration successful',
    201
  );
});

// ---------------------------------------------------------------------------
// Verify Email
// ---------------------------------------------------------------------------

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    throw new AppError('Invalid or missing verification token', 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Verification token is invalid or has expired', 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiry: null,
    },
  });

  logger.auth('email_verified', { userId: user.id, email: user.email, ip: req.ip });
  sendSuccess(res, null, 'Email verified successfully. You can now log in.');
});

// ---------------------------------------------------------------------------
// Resend Verification Email
// ---------------------------------------------------------------------------

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same response to prevent user enumeration
  if (!user || user.isEmailVerified) {
    return sendSuccess(res, null, 'If your account exists and is unverified, a new email has been sent.');
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const verifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken: rawToken, emailVerifyExpiry: verifyExpiry },
  });

  try {
    sendVerificationEmail(user, rawToken);
  } catch (emailErr) {
    logger.warn('Failed to resend verification email', { userId: user.id, error: emailErr.message });
  }

  sendSuccess(res, null, 'If your account exists and is unverified, a new email has been sent.');
});

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    logger.auth('login_failure', { email, reason: 'user_not_found_or_inactive', ip: req.ip });
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    logger.auth('login_failure', { email, userId: user.id, reason: 'wrong_password', ip: req.ip });
    throw new AppError('Invalid credentials', 401);
  }

  logger.auth('login_success', { userId: user.id, email: user.email, role: user.role, ip: req.ip });

  const token = generateToken(user.id, user.role);
  const { password: _, emailVerifyToken, emailVerifyExpiry, passwordResetToken, passwordResetExpiry, ...safeUser } = user;

  sendSuccess(res, {
    user: safeUser,
    token,
    // Soft-enforce: warn if email is not verified, but don't block login
    emailVerificationRequired: !user.isEmailVerified,
  }, 'Login successful');
});

// ---------------------------------------------------------------------------
// Get Current User
// ---------------------------------------------------------------------------

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      tenantProfile: true,
    },
  });

  sendSuccess(res, user);
});

// ---------------------------------------------------------------------------
// Forgot Password
// ---------------------------------------------------------------------------

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond the same to prevent user enumeration
  if (!user || !user.isActive) {
    return sendSuccess(
      res,
      null,
      'If that email exists in our system, a reset link has been sent.'
    );
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: rawToken,
      passwordResetExpiry: resetExpiry,
    },
  });

  try {
    sendPasswordResetEmail(user, rawToken);
  } catch (emailErr) {
    logger.warn('Failed to send password reset email', { userId: user.id, error: emailErr.message });
  }

  logger.auth('password_reset_request', { userId: user.id, email: user.email, ip: req.ip });

  sendSuccess(res, null, 'If that email exists in our system, a reset link has been sent.');
});

// ---------------------------------------------------------------------------
// Reset Password
// ---------------------------------------------------------------------------

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError('Password reset token is invalid or has expired', 400);
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpiry: null,
    },
  });

  logger.auth('password_reset_success', { userId: user.id, email: user.email, ip: req.ip });
  sendSuccess(res, null, 'Password reset successfully. You can now log in with your new password.');
});
