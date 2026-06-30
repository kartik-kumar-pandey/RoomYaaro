import { Router } from 'express';
import { getCompatibility } from '../controllers/compatibility.controller.js';
import { authenticate, authorizeTenant } from '../middlewares/auth.js';

const router = Router();

router.get('/:listingId', authenticate, authorizeTenant, getCompatibility);

export default router;
