import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, CheckCircle, FileCheck, RefreshCw, Shield, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function PendingApproval() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const isEmployer = user?.role === 'employer';
  const actionLabel = isEmployer ? 'post jobs' : 'apply for jobs';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const kycSubmittedAt = user?.kycSubmittedAt
    ? new Date(user.kycSubmittedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-900">
      {/* Top gradient bar */}
      <div className="bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 px-5 pt-12 pb-24 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-8 -right-8 w-44 h-44 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

        <div className="flex justify-end mb-4 relative z-10">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors"
          >
            <UserIcon size={13} /> View Profile
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Pulsing clock icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <Clock size={38} className="text-white" />
            </motion.div>
          </motion.div>
          <h1 className="text-2xl font-black text-white mb-2">KYC Submitted!</h1>
          <p className="text-white/75 text-sm font-medium leading-relaxed max-w-xs">
            Hi <span className="font-extrabold text-white">{user?.name || 'there'}</span>, your
            documents are under review. You'll be able to {actionLabel} once approved.
          </p>
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="flex-1 rounded-t-3xl -mt-8 z-10 relative bg-white dark:bg-dark-900 px-5 pt-8 pb-10"
      >
        {/* Progress steps */}
        <div className="flex flex-col gap-3 mb-8">
          {[
            { label: 'Account created', done: true, icon: CheckCircle, color: 'emerald' },
            { label: 'KYC documents submitted', done: true, icon: FileCheck, color: 'emerald' },
            {
              label: 'Admin reviewing your documents',
              done: false,
              icon: Shield,
              color: 'sky',
            },
            {
              label: `Account unlocked — ${actionLabel}`,
              done: false,
              icon: CheckCircle,
              color: 'slate',
            },
          ].map((s, i) => {
            const Icon = s.icon;
            const colors = {
              emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
              sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-500',
              slate: 'bg-slate-100 dark:bg-dark-700 text-slate-400',
            };
            const textColor = {
              emerald: 'text-emerald-800 dark:text-emerald-300',
              sky: 'text-sky-700 dark:text-sky-400',
              slate: 'text-slate-400 dark:text-slate-500',
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-600"
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    colors[s.color as keyof typeof colors]
                  }`}
                >
                  <Icon size={16} />
                </div>
                <span
                  className={`text-sm font-semibold capitalize ${
                    textColor[s.color as keyof typeof textColor]
                  }`}
                >
                  {s.label}
                </span>
                {s.done && (
                  <span className="ml-auto text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {kycSubmittedAt && (
          <div className="bg-slate-50 dark:bg-dark-800 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-dark-600">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Submitted at
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{kycSubmittedAt}</p>
          </div>
        )}

        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-8 text-center">
          Our admin team typically reviews documents within a few hours. Once approved, your account will
          unlock automatically on your next refresh.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary-600 text-white font-extrabold active:scale-95 transition-transform disabled:opacity-60 shadow-lg shadow-primary-500/25"
          >
            <motion.div
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
            >
              <RefreshCw size={17} />
            </motion.div>
            {refreshing ? 'Checking…' : 'Check Approval Status'}
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
