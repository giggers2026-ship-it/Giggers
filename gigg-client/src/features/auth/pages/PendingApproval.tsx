import React from 'react';
import { motion } from 'framer-motion';
import { Clock, LogOut, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function PendingApproval() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-dark-900">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Icon */}
        <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
          <Clock size={40} className="text-amber-500" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
          Account Under Review
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
          Hi <span className="font-bold text-slate-700 dark:text-slate-300">{user?.name || 'there'}</span>, your{' '}
          <span className="capitalize">{user?.role}</span> account has been submitted and is currently
          being reviewed by the Gigg admin team.
        </p>

        {/* Steps */}
        <div className="w-full flex flex-col gap-3 mb-10">
          {[
            { label: 'Account created', done: true },
            { label: 'Admin verification in progress', done: false },
            { label: 'Access granted', done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-600">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'}`}>
                {step.done ? <CheckCircle size={14} /> : <Clock size={14} />}
              </div>
              <span className={`text-sm font-semibold ${step.done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8 leading-relaxed">
          You will be notified once your account is approved. This typically takes 24–48 hours.
        </p>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-dark-600 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
