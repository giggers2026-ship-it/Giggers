import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

/**
 * POST /api/auth/login
 * Admin signs in with email + password via Supabase Auth.
 * Returns session tokens. Frontend stores them in memory/zustand.
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email ?? process.env.ADMIN_EMAIL;
  const password = req.body.password ?? process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  // Create a temporary client for sign in to avoid mutating the global supabaseAdmin client
  const { createClient } = require('@supabase/supabase-js');
  const tempSupabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await tempSupabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    res.status(401).json({ error: error?.message || 'Login failed' });
    return;
  }

  // Verify the user has admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    // Sign them out immediately if not admin
    await supabaseAdmin.auth.admin.signOut(data.session.access_token);
    res.status(403).json({ error: 'Access denied: admin role required' });
    return;
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile.role,
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh the access token using a refresh token.
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(400).json({ error: 'refresh_token is required' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.refreshSession({
    refresh_token,
  });

  if (error || !data.session) {
    res.status(401).json({ error: 'Failed to refresh session' });
    return;
  }

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
