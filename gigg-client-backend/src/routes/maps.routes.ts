import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { autocomplete, placeDetails, reverseGeocodeHandler } from '../controllers/maps.controller';

const router = Router();

// We remove requireAuth so the Registration flow can use these endpoints without a token

// Place search autocomplete (India only)
router.get('/autocomplete', autocomplete);

// Get lat/lng for a selected place
router.get('/place', placeDetails);

// Get address/city/area from lat/lng
router.get('/reverse-geocode', reverseGeocodeHandler);

export default router;
