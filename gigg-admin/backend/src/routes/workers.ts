import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

// Profile fields counted toward "fillup" (profile completeness) — X/8.
const FILLUP_FIELDS = ['name', 'city', 'area', 'bio', 'skills', 'categories', 'aadhaar_verified', 'selfie_verified'] as const;

function computeFillup(profile: Record<string, unknown>): { done: number; total: number } {
  let done = 0;
  for (const field of FILLUP_FIELDS) {
    const value = profile[field];
    if (Array.isArray(value) ? value.length > 0 : Boolean(value)) done++;
  }
  return { done, total: FILLUP_FIELDS.length };
}

// GET /api/workers/activity — paginated worker activity: fillup, followup, compliance.
router.get('/activity', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { data: profiles, error: profilesError, count } = await supabaseAdmin
    .from('profiles')
    .select('id, name, avatar, city, bio, skills, categories, aadhaar_verified, selfie_verified', { count: 'exact' })
    .eq('role', 'worker')
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (profilesError) {
    res.status(500).json({ error: profilesError.message });
    return;
  }

  const workerIds = (profiles || []).map((p) => p.id);
  if (workerIds.length === 0) {
    res.json({ data: [], total: count || 0, page, limit });
    return;
  }

  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [applicationsResult, completionsResult] = await Promise.all([
    supabaseAdmin
      .from('applications')
      .select('id, worker_id, status, updated_at')
      .in('worker_id', workerIds)
      .in('status', ['hired', 'confirmed', 'completed']),
    supabaseAdmin
      .from('application_task_completions')
      .select('status, applications!inner(worker_id)')
      .in('applications.worker_id', workerIds),
  ]);

  const applications = applicationsResult.data || [];
  const completions = (completionsResult.data || []) as unknown as { status: string; applications: { worker_id: string } }[];

  const followupByWorker = new Map<string, number>();
  for (const app of applications) {
    if (app.status === 'hired' && app.updated_at && app.updated_at < staleThreshold) {
      followupByWorker.set(app.worker_id, (followupByWorker.get(app.worker_id) || 0) + 1);
    }
  }

  const complianceByWorker = new Map<string, { done: number; total: number }>();
  for (const c of completions) {
    const workerId = c.applications?.worker_id;
    if (!workerId) continue;
    const entry = complianceByWorker.get(workerId) || { done: 0, total: 0 };
    entry.total += 1;
    if (c.status === 'complete') entry.done += 1;
    complianceByWorker.set(workerId, entry);
  }

  const data = (profiles || []).map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    city: p.city,
    fillup: computeFillup(p),
    followup: { staleCount: followupByWorker.get(p.id) || 0 },
    compliance: complianceByWorker.get(p.id) || { done: 0, total: 0 },
  }));

  res.json({ data, total: count || 0, page, limit });
});

export default router;
