import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

/**
 * GET /api/analytics/summary
 * Platform-wide KPI metrics for the dashboard
 */
router.get('/summary', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const [
    usersResult,
    jobsResult,
    activeJobsResult,
    completedJobsResult,
    pendingKycResult,
    todayUsersResult,
    todayJobsResult,
  ] = await Promise.all([
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabaseAdmin.from('kyc_documents').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabaseAdmin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 86400000).toISOString()),
  ]);

  res.json({
    totalUsers: usersResult.count || 0,
    totalJobs: jobsResult.count || 0,
    activeJobs: activeJobsResult.count || 0,
    completedJobs: completedJobsResult.count || 0,
    pendingKyc: pendingKycResult.count || 0,
    newUsersToday: todayUsersResult.count || 0,
    newJobsToday: todayJobsResult.count || 0,
  });
});

/**
 * GET /api/analytics/growth
 * User + job growth over the last 30 days (grouped by day)
 */
router.get('/growth', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [usersGrowth, jobsGrowth] = await Promise.all([
    supabaseAdmin
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at'),
    supabaseAdmin
      .from('jobs')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at'),
  ]);

  // Group by date
  const groupByDay = (rows: { created_at: string }[]) => {
    const map: Record<string, number> = {};
    for (const row of rows) {
      const day = row.created_at.split('T')[0];
      map[day] = (map[day] || 0) + 1;
    }
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  };

  res.json({
    users: groupByDay(usersGrowth.data || []),
    jobs: groupByDay(jobsGrowth.data || []),
  });
});

/**
 * GET /api/analytics/jobs-by-category
 * Job count per category
 */
router.get('/jobs-by-category', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select('category');

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const categoryCount: Record<string, number> = {};
  for (const job of data || []) {
    categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
  }

  const result = Object.entries(categoryCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});

export default router;
