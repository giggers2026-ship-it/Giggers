import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { sendOtpHandler, verifyOtpHandler, meHandler, refreshHandler } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Strict rate limit on OTP send — prevent SMS abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { error: 'Too many OTP requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/send-otp', otpLimiter, sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
router.get('/me', requireAuth, meHandler);
router.post('/refresh', requireAuth, refreshHandler);

export default router;
