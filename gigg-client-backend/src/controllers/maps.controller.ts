import { Response } from 'express';
import { z } from 'zod';
import { placesAutocomplete, getPlaceDetails, reverseGeocode } from '../services/maps.service';
import { AuthenticatedRequest } from '../types';

// GET /api/maps/reverse-geocode?lat=...&lng=...
export async function reverseGeocodeHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({ lat: z.string(), lng: z.string() }).safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }
  
  try {
    const lat = parseFloat(result.data.lat);
    const lng = parseFloat(result.data.lng);
    const details = await reverseGeocode(lat, lng);
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}


// GET /api/maps/autocomplete?input=...&session=...
export async function autocomplete(req: AuthenticatedRequest, res: Response): Promise<void> {
  const input = req.query.input as string;
  const session = req.query.session as string | undefined;

  if (!input || input.length < 2) {
    res.json({ predictions: [] });
    return;
  }

  try {
    const predictions = await placesAutocomplete(input, session);
    res.json({ predictions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/maps/place?placeId=...
export async function placeDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({ placeId: z.string().min(1) }).safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ error: 'placeId is required' });
    return;
  }

  try {
    const details = await getPlaceDetails(result.data.placeId);
    res.json(details);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
