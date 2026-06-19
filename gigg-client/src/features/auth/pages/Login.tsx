import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, User, Briefcase, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Button, Input } from '../../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'worker' | 'employer' | 'admin'>('worker');
  const { addToast } = useUIStore();
  const { sendOtp } = useAuthStore();
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) { addToast('Enter a valid 10-digit phone number', 'error'); return; }
    setSending(true);
    try {
      await sendOtp(phone);
      addToast('OTP sent to your phone 📲', 'success');
      navigate(`/otp?phone=${encodeURIComponent(phone)}&role=${role}&mode=login`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      addToast(msg, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-6">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-3xl font-black text-white mb-2">Welcome Back 👋</h1>
        <p className="text-white/70 font-medium">Sign in with your phone number</p>
      </div>

      {/* Form card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
        className="flex-1 bg-white dark:bg-dark-900 rounded-t-3xl -mt-8 px-6 pt-8 pb-6 z-10"
      >

        <div className="flex flex-col gap-4">
          {/* Role Toggle Selector */}
          <div className="bg-slate-100 dark:bg-dark-800 p-1.5 rounded-2xl flex relative mb-2">
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all z-10 flex items-center justify-center gap-2 ${
                role === 'worker'
                  ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <User size={15} />
              Work Searching
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`flex-1 py-3 text-xs font-black rounded-xl transition-all z-10 flex items-center justify-center gap-2 ${
                role === 'employer'
                  ? 'bg-white dark:bg-dark-700 text-primary-600 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Briefcase size={15} />
              Worker Hiring
            </button>
          </div>

          <div>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter your 10-digit number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              leftIcon={<Phone size={16} />}
            />
            <p className="text-xs text-amber-600 mt-1 ml-1">Any 10-digit number works. OTP will be <strong>1234</strong>.</p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/10 p-3.5 rounded-2xl border border-primary-100 dark:border-primary-800/30">
            <p className="text-[11px] font-medium text-primary-700 dark:text-primary-400 leading-relaxed">
              We'll send a 4-digit OTP to verify your phone number. No password needed.
            </p>
          </div>

          <Button fullWidth size="lg" loading={sending} onClick={handleSendOtp} rightIcon={<ArrowRight size={18} />}>
            Send OTP
          </Button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-medium mt-2">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="text-primary-600 dark:text-primary-400 font-extrabold">Sign Up</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
