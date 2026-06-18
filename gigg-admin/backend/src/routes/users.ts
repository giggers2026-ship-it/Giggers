import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// All user routes require admin auth
router.use(requireAdmin);

/**
 * GET /api/users
 * List all users with pagination, search, role filter
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;
  const role = req.query.role as string | undefined;
  const approved = req.query.approved as string | undefined; // 'true' | 'false'
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (role) {
    query = query.eq('role', role);
  }
  if (approved === 'false') {
    query = query.eq('is_approved', false);
  } else if (approved === 'true') {
    query = query.eq('is_approved', true);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

/**
 * GET /api/users/:id
 * Get full user profile with jobs + wallet summary
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const [profileResult, jobsResult, transactionsResult] = await Promise.all([
    supabaseAdmin.from('profiles').select('*').eq('id', id).single(),
    supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('employer_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  if (profileResult.error) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    profile: profileResult.data,
    recentJobs: jobsResult.data || [],
    recentTransactions: transactionsResult.data || [],
  });
});

/**
 * PATCH /api/users/:id
 * Update user profile fields (e.g., verify, update role)
 */
router.patch('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent accidental full overwrites
  const allowedFields = ['name', 'is_verified', 'is_verified_employer', 'role', 'city', 'area'];
  const filteredUpdates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in updates) filteredUpdates[key] = updates[key];
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(filteredUpdates)
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
 * PATCH /api/users/:id/approve
 * Approve or reject a new user account registration
 */
router.patch('/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { approved } = req.body;

  if (typeof approved !== 'boolean') {
    res.status(400).json({ error: '"approved" (boolean) is required' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ is_approved: approved })
    .eq('id', id)
    .select('id, name, role, is_approved')
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  // Notify the user of approval decision
  const notificationType = approved ? 'account_approved' : 'account_rejected';
  const notificationTitle = approved ? 'Account Approved! 🎉' : 'Account Not Approved';
  const notificationMessage = approved
    ? 'Your Gigg account has been approved. You can now access all features.'
    : 'Your account application was not approved. Please contact support for more information.';

  await supabaseAdmin.from('notifications').insert({
    user_id: id,
    type: notificationType,
    title: notificationTitle,
    message: notificationMessage,
    is_read: false,
  });

  res.json({ message: approved ? 'User approved' : 'User rejected', user: data });
});

/**
 * PATCH /api/users/:id/ban
 * Ban or unban a user
 */
router.patch('/:id/ban', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { banned, reason } = req.body;

  if (typeof banned !== 'boolean') {
    res.status(400).json({ error: '"banned" (boolean) is required' });
    return;
  }

  // Update Supabase Auth user banned status
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: banned ? '87600h' : 'none', // 10 years = effectively permanent
  });

  if (authError) {
    res.status(500).json({ error: authError.message });
    return;
  }

  // Record ban in profile
  const { data, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ is_banned: banned, ban_reason: reason || null })
    .eq('id', id)
    .select()
    .single();

  if (profileError) {
    res.status(500).json({ error: profileError.message });
    return;
  }

  res.json({ message: banned ? 'User banned' : 'User unbanned', user: data });
});

/**
 * DELETE /api/users/:id
 * Permanently delete a user (Auth + profile)
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: 'User deleted successfully' });
});

export default router;
