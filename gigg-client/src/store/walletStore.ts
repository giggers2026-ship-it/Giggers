import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletData } from '../types';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { useAuthStore } from './authStore';

interface WalletState {
  wallet: WalletData | null;
  isLoading: boolean;
  fetchWallet: () => Promise<void>;
  createTopUpOrder: (amountRupees: number) => Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  }>;
  verifyTopUp: (orderId: string, paymentId: string, signature: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      isLoading: false,

      fetchWallet: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        set({ isLoading: true });

        // Use maybeSingle() — returns null instead of 406 when the row doesn't exist yet
        const { data: walletData } = await supabase
          .from('wallets')
          .select('balance, escrow_balance')
          .eq('user_id', user.id)
          .maybeSingle();

        // Auto-create a zero-balance wallet for brand-new users
        if (!walletData) {
          await supabase
            .from('wallets')
            .upsert({ user_id: user.id, balance: 0, escrow_balance: 0 }, { onConflict: 'user_id', ignoreDuplicates: true });
        }

        const { data: txns } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        set({
          wallet: {
            currentBalance: walletData?.balance ?? 0,
            pendingBalance: walletData?.escrow_balance ?? 0,
            totalEarnings: 0,
            totalWithdrawn: 0,
            transactions: (txns || []).map((t: any) => ({
              id: t.id,
              type: t.type,
              amount: t.amount,
              description: t.description,
              date: t.created_at,
              status: t.status,
              category: t.category || 'earning',
            })),
          },
          isLoading: false,
        });
      },

      createTopUpOrder: async (amountRupees: number) => {
        const res = await api.post<{ orderId: string; amount: number; currency: string; keyId: string }>(
          '/api/payments/order',
          { amount: amountRupees * 100, type: 'wallet_topup' }
        );
        return res;
      },

      verifyTopUp: async (orderId: string, paymentId: string, signature: string) => {
        await api.post('/api/payments/verify', {
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        });
        // Refresh wallet after successful top-up
        await get().fetchWallet();
      },

      fetchTransactions: async () => {
        await get().fetchWallet();
      },
    }),
    {
      name: 'giggers-wallet',
      partialize: (s) => ({ wallet: s.wallet }),
    }
  )
);
