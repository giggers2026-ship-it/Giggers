import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import {
  updateLocation,
  getJobLocations,
  getWorkerDistance,
  geocodeHandler,
} from '../controllers/tracking.controller';

const router = Router();

router.use(requireAuth);

// Worker pushes GPS ping
router.post('/update', requireRole('worker'), updateLocation);

// Employer views all workers on a job map
router.get('/job/:jobId', requireRole('employer'), getJobLocations);

// Worker checks their distance to job site
router.get('/worker/distance', requireRole('worker'), getWorkerDistance);

// Any authenticated user can reverse-geocode
router.post('/geocode', geocodeHandler);

export default router;
