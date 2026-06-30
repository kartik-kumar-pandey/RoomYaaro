import { Router } from 'express';
import authRoutes from './auth.routes.js';
import listingRoutes from './listing.routes.js';
import tenantRoutes from './tenant.routes.js';
import compatibilityRoutes from './compatibility.routes.js';
import interestRoutes from './interest.routes.js';
import chatRoutes from './chat.routes.js';
import adminRoutes from './admin.routes.js';
import testEmailRoute from './testEmail.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/tenant', tenantRoutes);
router.use('/compatibility', compatibilityRoutes);
router.use('/interest', interestRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);
router.use('/test-email', testEmailRoute);

export default router;
