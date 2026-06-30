import { Router } from 'express';
import { getChatMessages, getUserChatRooms } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.get('/rooms', getUserChatRooms);
router.get('/:roomId', getChatMessages);

export default router;
