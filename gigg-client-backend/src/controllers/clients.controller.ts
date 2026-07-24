import { Response } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { supabase } from '../utils/supabase';
import { signToken } from '../utils/jwt';

const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number');

// POST /api/clients/invite — employer invites a client to view a job's pipeline
export async function inviteClient(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = z.object({
    jobId: z.string().uuid(),
    name: z.string().min(1),
    phone: phoneSchema,
  }).safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }
  const { jobId, name, phone } = parsed.data;

  const { data: job } = await supabase.from('jobs').select('id, employer_id').eq('id', jobId).single();
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.employer_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the job owner can invite clients' });
    return;
  }

  const inviteToken = randomUUID();

  const { data: existing } = await supabase.from('job_clients').select('id').eq('job_id', jobId).eq('phone', phone).maybeSingle();

  const { data: jobClient, error } = existing
    ? await supabase.from('job_clients').update({ name, invite_token: inviteToken }).eq('id', existing.id).select('*').single()
    : await supabase.from('job_clients').insert({ job_id: jobId, employer_id: req.user!.id, name, phone, invite_token: inviteToken }).select('*').single();

  if (error || !jobClient) {
    res.status(500).json({ error: error?.message || 'Failed to invite client' });
    return;
  }

  // Ensure a profile with role='client' exists for this phone so the client
  // has a stable identity across jobs they're invited to.
  const { data: existingProfile } = await supabase.from('profiles').select('id').eq('phone', phone).eq('role', 'client').maybeSingle();
  if (!existingProfile) {
    const { error: profileError } = await supabase.from('profiles').insert({ phone, name, role: 'client', is_approved: true, is_verified: true });
    if (profileError) {
      console.error('[clients] failed to create client profile:', profileError);
      res.status(500).json({ error: 'Failed to create client profile: ' + profileError.message });
      return;
    }
  }

  res.json({
    jobClient: {
      id: jobClient.id,
      jobId: jobClient.job_id,
      name: jobClient.name,
      phone: jobClient.phone,
      inviteToken: jobClient.invite_token,
      invitedAt: jobClient.invited_at,
    },
    // Frontend builds the shareable link as `${origin}/client/invite/${inviteToken}`
    inviteToken,
  });
}

// POST /api/clients/redeem — exchanges a magic-link invite_token for a client JWT
export async function redeemInvite(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = z.object({ inviteToken: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Missing invite token' });
    return;
  }

  const { data: jobClient } = await supabase.from('job_clients').select('*').eq('invite_token', parsed.data.inviteToken).single();
  if (!jobClient) {
    res.status(404).json({ error: 'Invalid or expired invite link' });
    return;
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('phone', jobClient.phone).eq('role', 'client').single();
  if (!profile) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  await supabase.from('job_clients').update({ last_viewed_at: new Date().toISOString() }).eq('id', jobClient.id);

  const payload: JwtPayload = { id: profile.id, phone: profile.phone, role: 'client', name: profile.name };
  const token = signToken(payload);

  res.json({
    token,
    user: { id: profile.id, name: profile.name, phone: profile.phone, role: 'client' },
    jobId: jobClient.job_id,
  });
}

// GET /api/clients/my-jobs — jobs the authenticated client has been invited to
export async function myClientJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (req.user!.role !== 'client') {
    res.status(403).json({ error: 'Client role required' });
    return;
  }

  const { data: invites } = await supabase
    .from('job_clients')
    .select('job_id, jobs(id, title, category, category_emoji, date, location, status)')
    .eq('phone', req.user!.phone);

  const jobs = (invites || [])
    .map((i: any) => i.jobs)
    .filter(Boolean)
    .map((j: any) => ({
      id: j.id,
      title: j.title,
      category: j.category,
      categoryEmoji: j.category_emoji,
      date: j.date,
      location: j.location,
      status: j.status,
    }));

  res.json({ jobs });
}

// DELETE /api/clients/:jobClientId — employer revokes a client's access
export async function revokeClient(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { jobClientId } = req.params;
  const { data: jobClient } = await supabase.from('job_clients').select('employer_id').eq('id', jobClientId).single();
  if (!jobClient) {
    res.status(404).json({ error: 'Invite not found' });
    return;
  }
  if (jobClient.employer_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the inviting employer can revoke access' });
    return;
  }

  await supabase.from('job_clients').delete().eq('id', jobClientId);
  res.json({ success: true });
}
