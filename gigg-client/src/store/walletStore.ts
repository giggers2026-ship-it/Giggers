import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletData } from '../types';
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
  releaseEscrow: (amount: number, description: string) => Promise<void>;
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

        try {
          const [walletData, history] = await Promise.all([
            api.get<{ balance: number; escrowBalance: number }>('/api/payments/wallet'),
            api.get<{ data: any[] }>('/api/payments/history'),
          ]);

          set({
            wallet: {
              currentBalance: walletData.balance,
              pendingBalance: walletData.escrowBalance,
              totalEarnings: 0,
              totalWithdrawn: 0,
              transactions: (history.data || []).map((t: any) => ({
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
        } catch {
          set({ isLoading: false });
        }
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
      releaseEscrow: async (amount: number, description: string) => {
        console.log(`Escrow released: ₹${amount} for ${description}`);
      },
    }),
    {
      name: 'giggers-wallet',
      partialize: (s) => ({ wallet: s.wallet }),
    }
  )
);
