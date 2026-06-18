// ============================================================
// Gigg Admin Panel — Shared TypeScript Types
// ============================================================

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
}

// ── User Profile ──────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'worker' | 'employer' | 'admin';
  avatar?: string;
  is_verified: boolean;
  is_approved: boolean;
  is_banned: boolean;
  ban_reason?: string;
  aadhaar_verified: boolean;
  selfie_verified: boolean;
  city: string;
  area: string;
  created_at: string;
  completed_jobs: number;
  total_jobs_posted: number;
  rating: number;
  review_count: number;
  total_earnings: number;
  company_name?: string;
  is_verified_employer?: boolean;
}

// ── Jobs ──────────────────────────────────────────────────────

export type JobStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  title: string;
  category: string;
  category_emoji: string;
  description: string;
  date: string;
  reporting_time: string;
  location: string;
  workers_needed: number;
  workers_hired: number;
  pay_per_worker: number;
  status: JobStatus;
  employer_id: string;
  is_featured: boolean;
  is_urgent: boolean;
  created_at: string;
  applicants_count: number;
  profiles?: { name: string; avatar?: string };
}

// ── Applications ──────────────────────────────────────────────

export type ApplicationStatus = 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'completed';

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  applied_at: string;
  profiles?: { name: string; avatar?: string; rating?: number };
}

// ── Transactions ──────────────────────────────────────────────

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'success' | 'pending' | 'failed';
export type TransactionCategory = 'earning' | 'withdrawal' | 'topup' | 'refund' | 'platform_fee';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  category: TransactionCategory;
  created_at: string;
  profiles?: { name: string; email: string };
}

// ── KYC ──────────────────────────────────────────────────────

export type KYCStatus = 'pending' | 'approved' | 'rejected';
export type KYCType = 'aadhaar' | 'selfie';

export interface KYCDocument {
  id: string;
  user_id: string;
  type: KYCType;
  status: KYCStatus;
  front_url?: string;
  back_url?: string;
  selfie_url?: string;
  aadhaar_number?: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  profiles?: { name: string; email: string; avatar?: string };
}

// ── Analytics ─────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalUsers: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  pendingKyc: number;
  newUsersToday: number;
  newJobsToday: number;
}

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export interface GrowthData {
  users: GrowthDataPoint[];
  jobs: GrowthDataPoint[];
}

// ── Pagination ────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
