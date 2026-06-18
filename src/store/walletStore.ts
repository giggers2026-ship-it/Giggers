import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WalletData } from '../types';
import { mockApi } from '../data/mockData';

interface WalletState {
  wallet: WalletData | null;
  platformWallet: {
    escrow: number;
    feesEarned: number;
  };
  isLoading: boolean;
  fetchWallet: (role?: string) => Promise<void>;
  withdraw: (amount: number) => void;
  addMoney: (amount: number) => void;
  payForJob: (amount: number, fee: number, jobTitle: string) => void;
  releaseEscrow: (amount: number, jobTitle: string) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null, 
      platformWallet: { escrow: 0, feesEarned: 0 },
      isLoading: false,
      fetchWallet: async () => {
        if (get().wallet) return; // Don't overwrite persisted data
        set({ isLoading: true });
        const wallet = await mockApi.getWallet();
        set({ wallet, isLoading: false });
      },
  withdraw: (amount) => set(s => {
    if (!s.wallet) return s;
    return { wallet: { ...s.wallet, currentBalance: s.wallet.currentBalance - amount, totalWithdrawn: s.wallet.totalWithdrawn + amount, transactions: [{ id: `t-${Date.now()}`, type: 'debit' as const, amount, description: 'Withdrawal to Bank Account', date: new Date().toISOString(), status: 'success' as const, category: 'withdrawal' as const }, ...s.wallet.transactions] } };
  }),
  addMoney: (amount) => set(s => {
    if (!s.wallet) return s;
    return { wallet: { ...s.wallet, currentBalance: s.wallet.currentBalance + amount, transactions: [{ id: `t-${Date.now()}`, type: 'credit' as const, amount, description: 'Wallet Top-up', date: new Date().toISOString(), status: 'success' as const, category: 'topup' as const }, ...s.wallet.transactions] } };
  }),
  payForJob: (amount, fee, jobTitle) => set(s => {
    if (!s.wallet) return s;
    const totalDeducted = amount + fee;
    return { 
      wallet: { ...s.wallet, currentBalance: s.wallet.currentBalance - totalDeducted, transactions: [{ id: `t-${Date.now()}`, type: 'debit' as const, amount: totalDeducted, description: `Payment & Escrow for ${jobTitle}`, date: new Date().toISOString(), status: 'success' as const, category: 'withdrawal' as const }, ...s.wallet.transactions] },
      platformWallet: {
        escrow: s.platformWallet.escrow + amount,
        feesEarned: s.platformWallet.feesEarned + fee
      }
    };
  }),
  releaseEscrow: (amount, jobTitle) => set(s => {
    // In a real app, this adds money to the worker. Since the mock worker isn't logged in right now, we deduct it from the global escrow.
    return {
      platformWallet: {
        ...s.platformWallet,
        escrow: s.platformWallet.escrow - amount
      }
    };
  }),
  }),
  { name: 'giggers-wallet' }
));
