import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import paymentRoutes from './routes/payment.routes';
import trackingRoutes from './routes/tracking.routes';
import mapsRoutes from './routes/maps.routes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ── Security headers
app.use(helmet());

// ── CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

// ── Body parsing
// Razorpay webhook needs raw body — register BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));

// ── Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
}));

// ── Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/maps', mapsRoutes);

// ── 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`gigg-client-backend running on http://localhost:${PORT}`);
  console.log(`  Auth:     POST /api/auth/send-otp, POST /api/auth/verify-otp`);
  console.log(`  Payments: POST /api/payments/order, POST /api/payments/verify`);
  console.log(`  Tracking: POST /api/tracking/update, GET /api/tracking/job/:id`);
  console.log(`  Maps:     GET  /api/maps/autocomplete, GET /api/maps/place`);
});

export default app;
