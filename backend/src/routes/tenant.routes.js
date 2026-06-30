import { Router } from 'express';
import {
  getTenantProfile,
  updateTenantProfile,
  getTenantDashboard,
  getRecommendationsHandler,
  profileValidation,
} from '../controllers/tenant.controller.js';
import { authenticate, authorizeTenant } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate, authorizeTenant);

router.get('/dashboard', getTenantDashboard);
router.get('/profile', getTenantProfile);
router.put('/profile', profileValidation, validate, updateTenantProfile);
router.get('/recommendations', getRecommendationsHandler);

export default router;
