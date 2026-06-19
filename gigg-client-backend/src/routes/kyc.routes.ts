import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { submitKycHandler } from '../controllers/kyc.controller';

const router = Router();

router.post('/submit', requireAuth, submitKycHandler);

export default router;
