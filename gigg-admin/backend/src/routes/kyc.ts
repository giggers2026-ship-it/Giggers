import { Router, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
router.use(requireAdmin);

/**
 * GET /api/kyc
 * List all KYC submissions (optionally filter by status)
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const status = (req.query.status as string) || 'pending';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabaseAdmin
    .from('kyc_documents')
    .select('*, profiles!kyc_documents_user_id_fkey(name, email, avatar)', { count: 'exact' })
    .eq('status', status)
    .range(offset, offset + limit - 1)
    .order('submitted_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

/**
 * GET /api/kyc/:id
 * Get specific KYC document detail
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('kyc_documents')
    .select('*, profiles!kyc_documents_user_id_fkey(*)')
    .eq('id', id)
    .single();

  if (error) {
    res.status(404).json({ error: 'KYC document not found' });
    return;
  }

  res.json(data);
});

/**
 * PATCH /api/kyc/:id/approve
 * Approve a KYC submission and mark user as verified
 */
router.patch('/:id/approve', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  // Get the KYC record first
  const { data: kyc, error: kycError } = await supabaseAdmin
    .from('kyc_documents')
    .select('user_id, type')
    .eq('id', id)
    .single();

  if (kycError || !kyc) {
    res.status(404).json({ error: 'KYC document not found' });
    return;
  }

  // Update KYC status
  const { error: updateError } = await supabaseAdmin
    .from('kyc_documents')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) {
    res.status(500).json({ error: updateError.message });
    return;
  }

  // Mark user as verified in profile
  const profileUpdates: Record<string, boolean> = {};
  if (kyc.type === 'aadhaar') profileUpdates['aadhaar_verified'] = true;
  if (kyc.type === 'selfie') profileUpdates['selfie_verified'] = true;

  // If both verified, set is_verified = true
  if (kyc.type === 'aadhaar' || kyc.type === 'selfie') {
    profileUpdates['is_verified'] = true;
  }

  await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', kyc.user_id);

  res.json({ message: 'KYC approved and user verified' });
});

/**
 * PATCH /api/kyc/:id/reject
 * Reject a KYC submission with a reason
 */
router.patch('/:id/reject', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;

  const { error } = await supabaseAdmin
    .from('kyc_documents')
    .update({
      status: 'rejected',
      rejection_reason: reason || 'Does not meet requirements',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ message: 'KYC rejected' });
});

export default router;
