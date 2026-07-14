import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, User, Briefcase, Shield, Eye } from 'lucide-react';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'worker' | 'employer'>('worker');
  const { addToast, theme, toggleTheme } = useUIStore();
  const { sendOtp } = useAuthStore();
  const [sending, setSending] = useState(false);

  const isWorker = role === 'worker';
  const accentColor = isWorker ? '#22c55e' : '#2563eb';
  const themeAccent = isWorker ? 'green' : 'blue';

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length < 10) {
      addToast('Enter a valid 10-digit phone number', 'error');
      return;
    }
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex flex-col justify-between font-sans transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full bg-white/50 dark:bg-dark-800/50 flex items-center justify-center text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 backdrop-blur-sm shadow-sm"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      {/* Background Glows */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-700"
          style={{ background: isWorker ? '#22c55e' : '#2563eb' }}
        />
        <div
          className="absolute -top-30 -right-30 w-80 h-80 rounded-full opacity-10 blur-3xl transition-all duration-700"
          style={{ background: isWorker ? '#16a34a' : '#1d4ed8' }}
        />
      </div>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6 z-10 max-w-md mx-auto w-full">
        {/* Centered Logo & Branding */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-card-lg border transition-all duration-500"
            style={{
              background: isWorker
                ? 'linear-gradient(135deg, #22c55e, #15803d)'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              borderColor: isWorker ? '#22c55e' : '#2563eb',
            }}
          >
            {/* Hexagon Connector Brand Logo */}
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 8L88 30.1V74.4L50 92L12 74.4V30.1L50 8Z" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="13" stroke="white" strokeWidth="6"/>
              <line x1="63" y1="50" x2="80" y2="50" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <path d="M40 37C32.8203 37 27 42.8203 27 50C27 57.1797 32.8203 63 40 63" stroke="white" strokeWidth="6" strokeLinecap="round"/>
            </svg>
          </motion.div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            Giggers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs tracking-wide">
            {isWorker ? 'Work. Earn. Grow.' : 'Hire. Track. Get Work Done.'}
          </p>
        </div>

        {/* Tab Header (Mock login/signup) */}
        <div className="bg-white/80 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/50 p-6 rounded-3xl shadow-card flex flex-col gap-6 backdrop-blur-md">
          <div className="flex border-b border-slate-200 dark:border-slate-700/60 pb-3 justify-around relative">
            <button
              className="text-sm font-bold transition-all duration-300 relative pb-1 text-slate-900 dark:text-white"
            >
              Login
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-[-13px] left-0 right-0 h-0.5"
                style={{ background: accentColor }}
              />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-300"
            >
              Sign Up
            </button>
          </div>

          {/* Role Toggle Selector */}
          <div className="bg-slate-100 dark:bg-[#0f172a] p-1 rounded-2xl flex gap-1 border border-slate-200 dark:border-slate-800">
            {(['worker', 'employer'] as const).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`
                    flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300
                    flex items-center justify-center gap-1.5 select-none
                    ${active ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'}
                  `}
                >
                  {r === 'worker' ? (
                    <User size={13} style={{ color: active ? '#22c55e' : undefined }} />
                  ) : (
                    <Briefcase size={13} style={{ color: active ? '#2563eb' : undefined }} />
                  )}
                  {r === 'worker' ? 'Worker Login' : 'Employer Login'}
                </button>
              );
            })}
          </div>

          {/* Phone Number Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider ml-1">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-medium text-sm transition-all duration-300 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-slate-500"
                style={{
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = accentColor;
                  e.target.style.boxShadow = `0 0 0 2px ${accentColor}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme === 'dark' ? '#334155' : '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <p className="text-[10px] text-amber-500/80 mt-1 ml-1 font-bold">
              OTP will be <span className="underline">1234</span> (Testing Mode)
            </p>
          </div>

          <div className="flex justify-end -mt-2">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-bold hover:underline transition-all"
              style={{ color: accentColor }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSendOtp}
            disabled={sending}
            className="w-full py-4 rounded-2xl text-white font-extrabold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              background: isWorker
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: isWorker
                ? '0 6px 20px rgba(34, 197, 94, 0.25)'
                : '0 6px 20px rgba(37, 99, 235, 0.25)',
            }}
          >
            {sending ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                Login <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest my-1">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            or
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Google Sign-In Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#1e293b]/40"
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26 9.76A7.08 7.08 0 0 1 12 4.9a6.9 6.9 0 0 1 4.84 1.91l3.61-3.61A12 12 0 0 0 12 0C7.37 0 3.35 2.73 1.34 6.72l3.92 3.04Z"/>
              <path fill="#FBBC05" d="M16.04 19.1A7.07 7.07 0 0 1 12 20.5a7.08 7.08 0 0 1-6.74-4.87l-3.91 3A12 12 0 0 0 12 24c3.16 0 6.09-1.16 8.31-3.07l-4.27-1.83Z"/>
              <path fill="#4285F4" d="M23.76 12.27c0-.86-.07-1.69-.22-2.5H12v4.73h6.6a5.65 5.65 0 0 1-2.45 3.71l4.27 1.83A11.95 11.95 0 0 0 23.76 12.27Z"/>
              <path fill="#34A853" d="M5.26 14.24A7.07 7.07 0 0 1 4.9 12c0-.78.13-1.54.36-2.24L1.34 6.72A12.05 12.05 0 0 0 0 12c0 1.92.45 3.74 1.26 5.35l4-3.11Z"/>
            </svg>
            Continue with Google
          </motion.button>
        </div>
      </div>

      {/* Security Note at bottom */}
      <div className="w-full py-6 flex items-center justify-center gap-2 border-t border-slate-200 dark:border-slate-900/60 bg-white dark:bg-[#0b0f19]">
        <Shield size={14} style={{ color: accentColor }} />
        <span className="text-[11px] text-slate-500 dark:text-slate-500 font-bold tracking-wider uppercase">
          {isWorker ? 'Safe. Secure. Always with you.' : 'Secure. Verified. Reliable.'}
        </span>
      </div>
    </div>
  );
}
