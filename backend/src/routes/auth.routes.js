import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middlewares/rateLimits.js';

const router = Router();

// Auth routes with targeted rate limiting
router.post('/register', registerLimiter, registerValidation, validate, register);
router.post('/login', loginLimiter, loginValidation, validate, login);
router.get('/me', authenticate, getMe);

// Email verification
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Password reset flow
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

export default router;
