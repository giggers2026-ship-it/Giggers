import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

/**
 * GET /api/payments
 * List all transactions with pagination + type filter
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const type = req.query.type as string | undefined;
  const status = req.query.status as string | undefined;
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('transactions')
    .select('*, profiles!transactions_user_id_fkey(name, email)', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

/**
 * GET /api/payments/summary
 * Financial summary for dashboard
 */
router.get('/summary', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { data: earnings, error: earningsError } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('type', 'credit')
    .eq('status', 'success');

  const { data: withdrawals, error: withdrawalsError } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('type', 'debit')
    .eq('category', 'withdrawal')
    .eq('status', 'success');

  const { data: pending } = await supabaseAdmin
    .from('transactions')
    .select('amount')
    .eq('status', 'pending');

  if (earningsError || withdrawalsError) {
    res.status(500).json({ error: 'Failed to fetch payment summary' });
    return;
  }

  const totalEarnings = (earnings || []).reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalWithdrawals = (withdrawals || []).reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingAmount = (pending || []).reduce((sum, t) => sum + (t.amount || 0), 0);

  res.json({
    totalEarnings,
    totalWithdrawals,
    pendingAmount,
    netRevenue: totalEarnings - totalWithdrawals,
  });
});

/**
 * PATCH /api/payments/:id/approve
 * Approve a pending withdrawal
 */
router.patch('/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'success' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data) {
    res.status(404).json({ error: 'Transaction not found or already processed' });
    return;
  }

  res.json({ message: 'Withdrawal approved', transaction: data });
});

/**
 * PATCH /api/payments/:id/reject
 * Reject a pending withdrawal
 */
router.patch('/:id/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .update({ status: 'failed', description: reason || 'Rejected by admin' })
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: 'Withdrawal rejected', transaction: data });
});

export default router;
