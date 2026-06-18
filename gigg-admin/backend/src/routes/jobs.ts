import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

/**
 * GET /api/jobs
 * List all jobs with pagination + status filter
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('jobs')
    .select('*, profiles!jobs_employer_id_fkey(name, avatar)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

/**
 * GET /api/jobs/:id
 * Full job detail with applicants
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const [jobResult, applicantsResult] = await Promise.all([
    supabaseAdmin
      .from('jobs')
      .select('*, profiles!jobs_employer_id_fkey(name, email, avatar)')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('applications')
      .select('*, profiles!applications_worker_id_fkey(name, avatar, rating)')
      .eq('job_id', id)
      .order('applied_at', { ascending: false }),
  ]);

  if (jobResult.error) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }

  res.json({ job: jobResult.data, applicants: applicantsResult.data || [] });
});

/**
 * PATCH /api/jobs/:id
 * Update job status (e.g., force-cancel)
 */
router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, is_featured, is_urgent } = req.body;

  const updates: Record<string, unknown> = {};
  if (status) updates['status'] = status;
  if (typeof is_featured === 'boolean') updates['is_featured'] = is_featured;
  if (typeof is_urgent === 'boolean') updates['is_urgent'] = is_urgent;

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

/**
 * DELETE /api/jobs/:id
 * Hard delete a job (admin only)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.from('jobs').delete().eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: 'Job deleted successfully' });
});

export default router;
