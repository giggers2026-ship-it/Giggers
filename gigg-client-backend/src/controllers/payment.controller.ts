import { Response, Request } from 'express';
import { z } from 'zod';
import { getRazorpay, verifyPaymentSignature, verifyWebhookSignature } from '../services/razorpay.service';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest } from '../types';

// POST /api/payments/order
// Creates a Razorpay order for wallet top-up or job payment
export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({
    amount: z.number().min(100).max(100000), // paise (100 = ₹1)
    type: z.enum(['wallet_topup', 'job_payment']),
    jobId: z.string().uuid().optional(),
  }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { amount, type, jobId } = result.data;
  const receipt = `gigg_${type}_${req.user!.id.slice(0, 8)}_${Date.now()}`;

  try {
    const order = await getRazorpay().orders.create({
      amount,
      currency: 'INR',
      receipt,
      notes: { userId: req.user!.id, type, jobId: jobId || '' },
    });

    // Record pending transaction in Supabase
    await supabase.from('transactions').insert({
      user_id: req.user!.id,
      type: 'credit',
      amount: amount / 100, // store in rupees
      status: 'pending',
      razorpay_order_id: order.id,
      description: type === 'wallet_topup' ? 'Wallet top-up' : `Job payment`,
      job_id: jobId || null,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create order' });
  }
}

// POST /api/payments/verify
// Called after Razorpay checkout succeeds on the frontend
export async function verifyPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
  }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;

  const valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!valid) {
    res.status(400).json({ error: 'Payment signature verification failed' });
    return;
  }

  // Fetch the pending transaction
  const { data: tx } = await supabase
    .from('transactions')
    .select('*')
    .eq('razorpay_order_id', razorpayOrderId)
    .eq('user_id', req.user!.id)
    .single();

  if (!tx) {
    res.status(404).json({ error: 'Transaction not found' });
    return;
  }

  // Mark transaction as success and credit wallet
  await supabase
    .from('transactions')
    .update({ status: 'success', razorpay_payment_id: razorpayPaymentId })
    .eq('id', tx.id);

  // Credit the wallet
  await supabase.rpc('increment_wallet_balance', {
    p_user_id: req.user!.id,
    p_amount: tx.amount,
  });

  res.json({ success: true, amount: tx.amount });
}

// POST /api/payments/webhook
// Razorpay webhook — handles async payment events (payment.captured, payment.failed)
export async function razorpayWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-razorpay-signature'] as string;
  if (!signature) {
    res.status(400).json({ error: 'Missing signature' });
    return;
  }

  const rawBody = JSON.stringify(req.body);
  if (!verifyWebhookSignature(rawBody, signature)) {
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const event = req.body.event as string;
  const payload = req.body.payload?.payment?.entity;

  if (event === 'payment.captured' && payload) {
    const orderId = payload.order_id as string;
    await supabase
      .from('transactions')
      .update({ status: 'success', razorpay_payment_id: payload.id })
      .eq('razorpay_order_id', orderId)
      .eq('status', 'pending');
  }

  if (event === 'payment.failed' && payload) {
    const orderId = payload.order_id as string;
    await supabase
      .from('transactions')
      .update({ status: 'failed' })
      .eq('razorpay_order_id', orderId)
      .eq('status', 'pending');
  }

  res.json({ received: true });
}

// GET /api/payments/history
export async function paymentHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const from = (page - 1) * limit;

  const { data, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  res.json({ data: data || [], total: count || 0, page, limit });
}
