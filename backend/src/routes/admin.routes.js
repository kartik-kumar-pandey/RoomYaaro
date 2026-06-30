import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  deleteAdminUser,
  toggleUserStatus,
  getAdminListings,
  deleteAdminListing,
  adminMarkListingFilled,
} from '../controllers/admin.controller.js';
import { authenticate, authorizeAdmin } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.delete('/user/:id', deleteAdminUser);
router.patch('/user/:id/toggle', toggleUserStatus);
router.get('/listings', getAdminListings);
router.delete('/listing/:id', deleteAdminListing);
router.patch('/listing/:id/fill', adminMarkListingFilled);

export default router;
