import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { autocomplete, placeDetails } from '../controllers/maps.controller';

const router = Router();

router.use(requireAuth);

// Place search autocomplete (India only)
router.get('/autocomplete', autocomplete);

// Get lat/lng for a selected place
router.get('/place', placeDetails);

export default router;
