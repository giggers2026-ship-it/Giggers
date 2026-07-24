import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { inviteClient, redeemInvite, myClientJobs, revokeClient } from '../controllers/clients.controller';

const router = Router();

router.post('/redeem', redeemInvite);

router.post('/invite', requireAuth, inviteClient);
router.get('/my-jobs', requireAuth, myClientJobs);
router.delete('/:jobClientId', requireAuth, revokeClient);

export default router;
