import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AdminUser } from '../types';
import apiClient from '../api/client';

interface AuthStore {
  user: AdminUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          set({
            user: data.user,
            token: data.access_token,
            refreshToken: data.refresh_token,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Login failed. Please check your credentials.';
          set({ isLoading: false, error: message, user: null, token: null });
          throw new Error(message);
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'gigg-admin-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
