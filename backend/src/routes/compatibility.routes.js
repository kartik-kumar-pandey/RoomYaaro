import { Router } from 'express';
import { getCompatibility } from '../controllers/compatibility.controller.js';
import { authenticate, authorizeTenant } from '../middlewares/auth.js';
import { aiLimiter } from '../middlewares/rateLimits.js';

const router = Router();

// AI limiter protects expensive Gemini/NVIDIA API calls from being abused
router.get('/:listingId', authenticate, authorizeTenant, aiLimiter, getCompatibility);

export default router;
