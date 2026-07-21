import { create } from 'zustand';
import { api } from '../lib/api';

export interface ClientJobSummary {
  id: string;
  title: string;
  category: string;
  categoryEmoji: string;
  date: string;
  location: string;
  status: string;
}

interface ClientState {
  jobs: ClientJobSummary[];
  isLoading: boolean;
  fetchMyClientJobs: () => Promise<void>;
  inviteClient: (jobId: string, name: string, phone: string) => Promise<string>;
}

export const useClientStore = create<ClientState>((set) => ({
  jobs: [],
  isLoading: false,

  fetchMyClientJobs: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get<{ jobs: ClientJobSummary[] }>('/api/clients/my-jobs');
      set({ jobs: res.jobs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  inviteClient: async (jobId: string, name: string, phone: string) => {
    const res = await api.post<{ inviteToken: string }>('/api/clients/invite', { jobId, name, phone });
    return res.inviteToken;
  },
}));
