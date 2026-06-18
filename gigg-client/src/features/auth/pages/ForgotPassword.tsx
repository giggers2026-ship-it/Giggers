import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button, Input } from '../../../components/ui';
import { useUIStore } from '../../../store/uiStore';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) { addToast('Enter your email', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    addToast('Reset link sent!', 'success');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex flex-col">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-5 pt-12 pb-20">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-6">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-3xl font-black text-white mb-2">Reset Password</h1>
        <p className="text-white/70 font-medium">We'll send you a reset link</p>
      </div>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex-1 bg-white dark:bg-dark-900 rounded-t-3xl -mt-8 px-6 pt-10 pb-6 z-10">
        {sent ? (
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Email Sent! 📧</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-xs">Check your inbox at <strong className="text-slate-700 dark:text-slate-300">{email}</strong> for the password reset link.</p>
            <Button onClick={() => navigate('/login')}>Back to Login</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Enter your registered email address and we'll send you a link to reset your password.</p>
            <Input label="Email Address" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} leftIcon={<Mail size={16} />} />
            <div className="mt-2">
              <Button fullWidth size="lg" loading={loading} onClick={handleSend}>Send Reset Link</Button>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              Remember it?{' '}
              <button onClick={() => navigate('/login')} className="text-primary-600 dark:text-primary-400 font-extrabold">Sign In</button>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
