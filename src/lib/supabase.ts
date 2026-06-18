import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Supabase client — anon key, subject to Row Level Security.
 * Import this wherever you need DB access in the Gigg app.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string;
          role: 'worker' | 'employer' | 'admin';
          avatar: string | null;
          is_verified: boolean;
          is_approved: boolean;
          is_banned: boolean;
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
          attendance_rate: number;
          company_name: string | null;
          is_verified_employer: boolean;
          bio: string | null;
          skills: string[] | null;
          languages: string[] | null;
          categories: string[] | null;
          gender: 'male' | 'female' | 'other' | null;
          age: number | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          category: string;
          category_emoji: string;
          description: string;
          date: string;
          reporting_time: string;
          end_time: string;
          location: string;
          address: string;
          lat: number;
          lng: number;
          workers_needed: number;
          workers_hired: number;
          pay_per_worker: number;
          food_provided: boolean;
          transport_provided: boolean;
          dress_code: string;
          languages_required: string[];
          gender_preference: 'any' | 'male' | 'female';
          status: 'draft' | 'active' | 'completed' | 'cancelled';
          employer_id: string;
          is_featured: boolean;
          is_urgent: boolean;
          created_at: string;
          applicants_count: number;
        };
      };
      applications: {
        Row: {
          id: string;
          job_id: string;
          worker_id: string;
          status: 'applied' | 'shortlisted' | 'accepted' | 'rejected' | 'completed';
          applied_at: string;
          updated_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'credit' | 'debit';
          amount: number;
          description: string;
          status: 'success' | 'pending' | 'failed';
          category: 'earning' | 'withdrawal' | 'topup' | 'refund' | 'platform_fee';
          created_at: string;
        };
      };
      chat_threads: {
        Row: {
          id: string;
          job_id: string;
          employer_id: string;
          worker_id: string;
          last_message: string | null;
          last_message_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['chat_threads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['chat_threads']['Row']>;
      };
      chat_messages: {
        Row: {
          id: string;
          thread_id: string;
          sender_id: string;
          text: string | null;
          type: string;
          sent_at: string;
          is_read: boolean;
        };
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'sent_at'>;
        Update: Partial<Database['public']['Tables']['chat_messages']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          is_read: boolean;
          action_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
    };
  };
};
