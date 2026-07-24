"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.verifyPayment = verifyPayment;
exports.razorpayWebhook = razorpayWebhook;
exports.getWallet = getWallet;
exports.paymentHistory = paymentHistory;
const zod_1 = require("zod");
const razorpay_service_1 = require("../services/razorpay.service");
const supabase_1 = require("../utils/supabase");
// POST /api/payments/order
// Creates a Razorpay order for wallet top-up or job payment
async function createOrder(req, res) {
    const result = zod_1.z.object({
        amount: zod_1.z.number().min(100).max(100000000), // paise (100 = ₹1) up to ₹1,000,000 for testing
        type: zod_1.z.enum(['wallet_topup', 'job_payment']),
        jobId: zod_1.z.string().uuid().optional(),
    }).safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: result.error.errors[0].message });
        return;
    }
    const { amount, type, jobId } = result.data;
    const amountInRupees = amount / 100;
    try {
        // TEST MODE: Directly increment wallet balance without Razorpay
        const { error: updateError } = await supabase_1.supabase.rpc('increment_wallet_balance', {
            p_user_id: req.user.id,
            p_amount: amountInRupees,
        });
        if (updateError) {
            console.error('Test Mode Wallet Update Error:', updateError);
            throw new Error('Failed to update wallet balance');
        }
        // Record success transaction in Supabase
        await supabase_1.supabase.from('transactions').insert({
            user_id: req.user.id,
            type: 'credit',
            amount: amountInRupees,
            status: 'success',
            razorpay_order_id: `test_order_${Date.now()}`,
            razorpay_payment_id: `test_payment_${Date.now()}`,
            description: type === 'wallet_topup' ? 'Wallet top-up (Test)' : `Job payment (Test)`,
            job_id: jobId || null,
        });
        res.json({
            orderId: `test_order_${Date.now()}`,
            amount: amount,
            currency: 'INR',
            keyId: 'test_key',
            testMode: true,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || 'Failed to create order' });
    }
}
// POST /api/payments/verify
// Called after Razorpay checkout succeeds on the frontend
async function verifyPayment(req, res) {
    const result = zod_1.z.object({
        razorpayOrderId: zod_1.z.string(),
        razorpayPaymentId: zod_1.z.string(),
        razorpaySignature: zod_1.z.string(),
    }).safeParse(req.body);
    if (!result.success) {
        res.status(400).json({ error: 'Invalid payload' });
        return;
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;
    const valid = (0, razorpay_service_1.verifyPaymentSignature)(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) {
        res.status(400).json({ error: 'Payment signature verification failed' });
        return;
    }
    // Fetch the pending transaction
    const { data: tx } = await supabase_1.supabase
        .from('transactions')
        .select('*')
        .eq('razorpay_order_id', razorpayOrderId)
        .eq('user_id', req.user.id)
        .single();
    if (!tx) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
    }
    // Mark transaction as success and credit wallet
    await supabase_1.supabase
        .from('transactions')
        .update({ status: 'success', razorpay_payment_id: razorpayPaymentId })
        .eq('id', tx.id);
    // Credit the wallet
    await supabase_1.supabase.rpc('increment_wallet_balance', {
        p_user_id: req.user.id,
        p_amount: tx.amount,
    });
    res.json({ success: true, amount: tx.amount });
}
// POST /api/payments/webhook
// Razorpay webhook — handles async payment events (payment.captured, payment.failed)
async function razorpayWebhook(req, res) {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
        res.status(400).json({ error: 'Missing signature' });
        return;
    }
    const rawBody = JSON.stringify(req.body);
    if (!(0, razorpay_service_1.verifyWebhookSignature)(rawBody, signature)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
    }
    const event = req.body.event;
    const payload = req.body.payload?.payment?.entity;
    if (event === 'payment.captured' && payload) {
        const orderId = payload.order_id;
        await supabase_1.supabase
            .from('transactions')
            .update({ status: 'success', razorpay_payment_id: payload.id })
            .eq('razorpay_order_id', orderId)
            .eq('status', 'pending');
    }
    if (event === 'payment.failed' && payload) {
        const orderId = payload.order_id;
        await supabase_1.supabase
            .from('transactions')
            .update({ status: 'failed' })
            .eq('razorpay_order_id', orderId)
            .eq('status', 'pending');
    }
    res.json({ received: true });
}
// GET /api/payments/wallet
async function getWallet(req, res) {
    const userId = req.user.id;
    let { data: walletRow } = await supabase_1.supabase
        .from('wallets')
        .select('balance, escrow_balance')
        .eq('user_id', userId)
        .maybeSingle();
    if (!walletRow) {
        const { data: created } = await supabase_1.supabase
            .from('wallets')
            .upsert({ user_id: userId, balance: 0, escrow_balance: 0 }, { onConflict: 'user_id', ignoreDuplicates: true })
            .select('balance, escrow_balance')
            .maybeSingle();
        walletRow = created ?? { balance: 0, escrow_balance: 0 };
    }
    res.json({
        balance: Number(walletRow.balance) || 0,
        escrowBalance: Number(walletRow.escrow_balance) || 0,
    });
}
// GET /api/payments/history
async function paymentHistory(req, res) {
    const page = Number(req.query.page) || 1;
    const limit = 20;
    const from = (page - 1) * limit;
    const { data, count } = await supabase_1.supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
    res.json({ data: data || [], total: count || 0, page, limit });
}
//# sourceMappingURL=payment.controller.js.map