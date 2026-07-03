import { Router } from 'express';
import authRoutes from './auth.routes.js';
import listingRoutes from './listing.routes.js';
import tenantRoutes from './tenant.routes.js';
import compatibilityRoutes from './compatibility.routes.js';
import interestRoutes from './interest.routes.js';
import chatRoutes from './chat.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/tenant', tenantRoutes);
router.use('/compatibility', compatibilityRoutes);
router.use('/interest', interestRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

// NOTE: /test-email route removed — test utilities must NEVER be exposed in production.
// Use the email service directly in integration tests with a mock transporter.

export default router;
