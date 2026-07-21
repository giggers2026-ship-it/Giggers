import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';
import { createOrder, verifyPayment, razorpayWebhook, paymentHistory, getWallet } from '../controllers/payment.controller';

const router = Router();

// Webhook must receive raw body — mount before express.json() parses it
router.post('/webhook', (req: Request, res: Response, next: NextFunction) => {
  razorpayWebhook(req, res).catch(next);
});

router.use(requireAuth);

router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', paymentHistory);
router.get('/wallet', getWallet);

export default router;
