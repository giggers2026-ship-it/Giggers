import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../components/layout/Navigation';
import { Button, Badge, Modal, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import { useUIStore } from '../../store/uiStore';
import { ArrowUpRight, ArrowDownLeft, Shield, Landmark, History } from 'lucide-react';

export default function Wallet() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wallet, platformWallet, fetchWallet, withdraw, addMoney, isLoading } = useWalletStore();
  const { addToast } = useUIStore();
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'withdraw' | 'add'>('withdraw');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (user) fetchWallet();
  }, [fetchWallet, user]);

  const handleTransaction = () => {
    const val = Number(amount);
    if (!val || val <= 0) return;
    
    if (modalType === 'withdraw') {
      if (val > (wallet?.currentBalance || 0)) {
        addToast('Insufficient balance', 'error');
        return;
      }
      withdraw(val);
      addToast(`₹${val} withdrawn to bank account`, 'success');
    } else {
      addMoney(val);
      addToast(`₹${val} added to wallet`, 'success');
    }
    
    setShowModal(false);
    setAmount('');
  };

  if (!user || !wallet) return null;

  const isWorker = !user.companyName;

  return (
    <div className="pb-24 font-sans">
      <AppHeader title="Wallet & Payments" showBack onBack={() => navigate(-1)} />

      <div className="px-5 pt-6 flex flex-col gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-primary-lg">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
          
          <div className="relative z-10">
            <p className="text-white/70 font-bold text-sm mb-1">{isWorker ? 'Available to Withdraw' : 'Current Balance'}</p>
            <h2 className="text-4xl font-black mb-6">₹{wallet.currentBalance.toLocaleString('en-IN')}</h2>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white text-primary-700 hover:bg-slate-50"
                onClick={() => { setModalType('withdraw'); setShowModal(true); }}
              >
                <ArrowUpRight size={18} /> Withdraw
              </Button>
              <Button 
                className="flex-1 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                onClick={() => { setModalType('add'); setShowModal(true); }}
              >
                <ArrowDownLeft size={18} /> Add Money
              </Button>
            </div>
          </div>
        </div>

        {/* Linked Account Info */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-dark-600 rounded-xl flex items-center justify-center text-slate-500">
              <Landmark size={20} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">HDFC Bank •••• 4521</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Shield size={12} /> Verified
              </p>
            </div>
          </div>
          <button className="text-xs font-bold text-primary-600 dark:text-primary-400">Change</button>
        </div>

        {/* Transactions */}
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <History size={20} className="text-slate-400" /> Recent Transactions
          </h3>
          <div className="flex flex-col gap-3">
            {wallet.transactions.map((tx, i) => (
              <motion.div 
                key={tx.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-600 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  }`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white mb-0.5 leading-tight">{tx.description}</p>
                    <p className="text-[10px] font-bold text-slate-400">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'} className="mt-1 text-[9px] px-1.5 py-0">
                    {tx.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform Stats (Mock Admin View) */}
        {!isWorker && (
          <div className="mt-4 pt-6 border-t border-slate-100 dark:border-dark-600">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield size={20} className="text-primary-500" /> Platform Stats (Mock)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-600">
                <p className="text-xs font-bold text-slate-500 mb-1">Funds in Escrow</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">₹{platformWallet.escrow.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-800/30">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mb-1">Fees Earned (10%)</p>
                <p className="text-xl font-black text-emerald-600">₹{platformWallet.feesEarned.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={modalType === 'withdraw' ? 'Withdraw Funds' : 'Add Money'}>
        <div className="py-2 flex flex-col gap-4">
          <Input 
            label="Amount (₹)" 
            type="number" 
            placeholder="0" 
            value={amount} 
            onChange={e => setAmount(e.target.value)} 
            autoFocus
          />
          {modalType === 'withdraw' && (
            <p className="text-xs font-medium text-slate-500">
              Funds will be transferred to HDFC Bank •••• 4521 instantly.
            </p>
          )}
          <Button fullWidth size="lg" onClick={handleTransaction}>
            {modalType === 'withdraw' ? 'Confirm Withdrawal' : 'Proceed to Pay'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
