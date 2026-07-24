import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { subscribePushHandler, unsubscribePushHandler, testPushHandler } from '../controllers/push.controller';

const router = Router();

router.use(requireAuth);

router.post('/subscribe', subscribePushHandler);
router.post('/unsubscribe', unsubscribePushHandler);
router.post('/test-push', testPushHandler);

export default router;
