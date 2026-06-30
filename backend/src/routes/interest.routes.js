import { Router } from 'express';
import {
  createInterest,
  acceptInterest,
  rejectInterest,
  getOwnerInterests,
  getTenantInterests,
} from '../controllers/interest.controller.js';
import { authenticate, authorizeOwner, authorizeTenant } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, authorizeTenant, createInterest);
router.get('/tenant', authenticate, authorizeTenant, getTenantInterests);
router.get('/owner', authenticate, authorizeOwner, getOwnerInterests);
router.put('/:id/accept', authenticate, authorizeOwner, acceptInterest);
router.put('/:id/reject', authenticate, authorizeOwner, rejectInterest);

export default router;
