import { Router } from 'express';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  markListingFilled,
  getOwnerDashboard,
  getOwnerListings,
  createListingValidation,
} from '../controllers/listing.controller.js';
import { authenticate, authorizeOwner } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.get('/', getListings);
router.get('/owner/dashboard', authenticate, authorizeOwner, getOwnerDashboard);
router.get('/owner/my-listings', authenticate, authorizeOwner, getOwnerListings);
router.get('/:id', getListingById);
router.post('/', authenticate, authorizeOwner, upload.array('photos', 10), createListingValidation, validate, createListing);
router.put('/:id', authenticate, authorizeOwner, upload.array('photos', 10), updateListing);
router.delete('/:id', authenticate, authorizeOwner, deleteListing);
router.patch('/:id/fill', authenticate, authorizeOwner, markListingFilled);

export default router;
