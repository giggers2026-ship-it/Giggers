import { Request, Response } from 'express';
import { z } from 'zod';
import { sendOtp, verifyOtp } from '../services/otp.service';
import { signToken } from '../utils/jwt';
import { supabase } from '../utils/supabase';
import { AuthenticatedRequest } from '../types';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

// POST /api/auth/send-otp
export async function sendOtpHandler(req: Request, res: Response): Promise<void> {
  const result = z.object({ phone: phoneSchema }).safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }
  try {
    await sendOtp(result.data.phone);
    res.json({ message: 'OTP sent successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to send OTP' });
  }
}

// POST /api/auth/verify-otp
export async function verifyOtpHandler(req: Request, res: Response): Promise<void> {
  const result = z.object({
    phone: phoneSchema,
    otp: z.string().length(6),
    name: z.string().min(2).optional(),
    role: z.enum(['worker', 'employer']).optional(),
  }).safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: result.error.errors[0].message });
    return;
  }

  const { phone, otp, name, role } = result.data;

  if (!verifyOtp(phone, otp)) {
    res.status(401).json({ error: 'Invalid or expired OTP' });
    return;
  }

  // Find or create profile in Supabase
  let { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role, is_approved, is_verified, avatar')
    .eq('phone', phone)
    .single();

  if (!profile) {
    // New user — register
    if (!name || !role) {
      res.status(400).json({ error: 'New user requires name and role', isNewUser: true });
      return;
    }
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({ phone, name, role, is_approved: false, is_verified: false })
      .select('id, name, role, is_approved, is_verified, avatar')
      .single();

    if (error || !newProfile) {
      res.status(500).json({ error: 'Failed to create profile' });
      return;
    }
    profile = newProfile;
  }

  const token = signToken({
    id: profile.id,
    phone,
    role: profile.role,
    name: profile.name,
  });

  res.json({
    token,
    user: {
      id: profile.id,
      name: profile.name,
      phone,
      role: profile.role,
      isApproved: profile.is_approved,
      isVerified: profile.is_verified,
      avatar: profile.avatar,
    },
  });
}

// GET /api/auth/me
export async function meHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user!.id)
    .single();

  if (error || !profile) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  res.json({ user: profile });
}

// POST /api/auth/refresh
export async function refreshHandler(req: AuthenticatedRequest, res: Response): Promise<void> {
  // User is already verified by requireAuth middleware — re-issue a fresh token
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, phone, role')
    .eq('id', req.user!.id)
    .single();

  if (!profile) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const token = signToken({
    id: profile.id,
    phone: profile.phone,
    role: profile.role,
    name: profile.name,
  });

  res.json({ token });
}
