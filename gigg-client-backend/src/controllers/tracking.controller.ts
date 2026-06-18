import { Response } from 'express';
import { z } from 'zod';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest } from '../types';
import { reverseGeocode, getDistanceMatrix } from '../services/maps.service';

// In-memory location cache — fast reads for live tracking
// Shape: { [jobId]: { [workerId]: WorkerLocation } }
const locationCache = new Map<string, Map<string, {
  lat: number; lng: number; accuracy?: number; updatedAt: string; name: string; avatar?: string;
}>>();

// POST /api/tracking/update
// Worker pushes their current GPS location
export async function updateLocation(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({
    jobId: z.string().uuid(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    accuracy: z.number().optional(),
  }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  if (req.user!.role !== 'worker') {
    res.status(403).json({ error: 'Only workers can update location' });
    return;
  }

  const { jobId, lat, lng, accuracy } = result.data;
  const workerId = req.user!.id;
  const updatedAt = new Date().toISOString();

  // Verify worker is hired for this job
  const { data: application } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('worker_id', workerId)
    .eq('status', 'accepted')
    .single();

  if (!application) {
    res.status(403).json({ error: 'You are not assigned to this job' });
    return;
  }

  // Update in-memory cache
  if (!locationCache.has(jobId)) locationCache.set(jobId, new Map());
  locationCache.get(jobId)!.set(workerId, {
    lat, lng, accuracy, updatedAt,
    name: req.user!.name,
  });

  // Persist to Supabase (upsert for real-time broadcast)
  await supabase
    .from('worker_locations')
    .upsert(
      { worker_id: workerId, job_id: jobId, lat, lng, accuracy, updated_at: updatedAt },
      { onConflict: 'worker_id,job_id' }
    );

  res.json({ success: true });
}

// GET /api/tracking/job/:jobId
// Employer fetches all hired workers' current locations for a job
export async function getJobLocations(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { jobId } = req.params;

  if (req.user!.role !== 'employer') {
    res.status(403).json({ error: 'Only employers can view worker locations' });
    return;
  }

  // Verify employer owns this job
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, location_lat, location_lng')
    .eq('id', jobId)
    .eq('employer_id', req.user!.id)
    .single();

  if (!job) {
    res.status(403).json({ error: 'Job not found or access denied' });
    return;
  }

  // Serve from cache if available (low-latency path)
  if (locationCache.has(jobId)) {
    const entries = Array.from(locationCache.get(jobId)!.entries()).map(([wid, loc]) => ({
      workerId: wid,
      ...loc,
    }));
    res.json({ locations: entries, jobLat: job.location_lat, jobLng: job.location_lng });
    return;
  }

  // Fall back to DB
  const { data: locations } = await supabase
    .from('worker_locations')
    .select('worker_id, lat, lng, accuracy, updated_at, profiles!worker_locations_worker_id_fkey(name, avatar)')
    .eq('job_id', jobId);

  const mapped = (locations || []).map((l: any) => ({
    workerId: l.worker_id,
    lat: l.lat,
    lng: l.lng,
    accuracy: l.accuracy,
    updatedAt: l.updated_at,
    name: l.profiles?.name || 'Unknown',
    avatar: l.profiles?.avatar,
  }));

  res.json({ locations: mapped, jobLat: job.location_lat, jobLng: job.location_lng });
}

// GET /api/tracking/worker/distance?jobId=
// Worker queries their own distance to the job site
export async function getWorkerDistance(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({
    jobId: z.string().uuid(),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
  }).safeParse(req.query);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { jobId, lat, lng } = result.data;

  const { data: job } = await supabase
    .from('jobs')
    .select('location_lat, location_lng, location')
    .eq('id', jobId)
    .single();

  if (!job?.location_lat) {
    res.status(404).json({ error: 'Job location not set' });
    return;
  }

  try {
    const result2 = await getDistanceMatrix(
      { lat, lng },
      { lat: job.location_lat, lng: job.location_lng }
    );
    res.json({ ...result2, jobAddress: job.location });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/tracking/geocode
// Reverse geocode a lat/lng to an address (used during job posting)
export async function geocodeHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({
    lat: z.number(),
    lng: z.number(),
  }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  try {
    const geo = await reverseGeocode(result.data.lat, result.data.lng);
    res.json(geo);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
