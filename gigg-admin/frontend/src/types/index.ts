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

export type KycStatus = 'not_started' | 'submitted' | 'approved' | 'rejected';

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
  aadhaar_number?: string;
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  pan_number?: string;
  pan_front_url?: string;
  pan_back_url?: string;
  selfie_url?: string;
  city: string;
  area: string;
  company_name?: string;
  kyc_status: KycStatus;
  kyc_submitted_at?: string;
  kyc_reviewed_at?: string;
  kyc_rejection_reason?: string;
  created_at: string;
  completed_jobs: number;
  total_jobs_posted: number;
  rating: number;
  review_count: number;
  total_earnings: number;
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

export type ApplicationStatus = 'applied' | 'shortlisted' | 'hired' | 'rejected' | 'completed' | 'no_show';

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
export type KYCType = 'identity';

export interface KYCDocument {
  id: string;
  user_id: string;
  type: KYCType;
  status: KYCStatus;
  /** Submitted personal info */
  full_name?: string;
  city?: string;
  area?: string;
  company_name?: string;
  /** Aadhaar */
  aadhaar_number?: string;
  front_url?: string;
  back_url?: string;
  /** PAN */
  pan_number?: string;
  pan_front_url?: string;
  pan_back_url?: string;
  /** Selfie */
  selfie_url?: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  /** Joined profile data */
  profiles?: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role?: 'worker' | 'employer';
    city?: string;
    area?: string;
    company_name?: string;
    kyc_status?: string;
  };
}

// ── Pipeline (read-only visibility for admin) ────────────────

export type TaskCompletionStatus = 'not_started' | 'in_progress' | 'submitted' | 'complete' | 'failed';

export interface JobTask {
  id: string;
  job_id: string;
  kind: 'opening' | 'task' | 'closing';
  sort_order: number;
  title: string;
  description: string;
  completion_type: 'image' | 'form' | 'tick';
}

export interface TaskCompletion {
  id: string;
  application_id: string;
  job_task_id: string;
  status: TaskCompletionStatus;
}

export interface JobPipeline {
  tasks: JobTask[];
  completionsByApplication: Record<string, TaskCompletion[]>;
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
