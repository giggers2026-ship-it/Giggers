import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  adminId?: string;
  adminEmail?: string;
}

/**
 * Middleware: validates the Supabase JWT sent in Authorization header.
 * Also checks that the user has role = 'admin' in the token metadata.
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using Supabase Admin client
    const { data: { user }, error: authError } = await require('../config/supabase').supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Since user.user_metadata or app_metadata.role might not be set accurately for our custom profiles,
    // we should verify the role against the profiles table!
    const { data: profile, error: profileError } = await require('../config/supabase').supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: admin role required' });
      return;
    }

    req.adminId = user.id;
    req.adminEmail = user.email;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Server error during authentication' });
  }
};
