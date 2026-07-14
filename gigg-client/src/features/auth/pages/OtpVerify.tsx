import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button, OtpInput } from '../../../components/ui';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

export default function OtpVerify() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get('phone') || '';
  const role = (params.get('role') || 'worker') as 'worker' | 'employer';
  const mode = params.get('mode') || 'login';
  const regName = params.get('name') || '';
  const regCity = params.get('city') || 'Mumbai';
  const regArea = params.get('area') || '';
  const regCompany = params.get('companyName') || '';

  const { addToast, theme, toggleTheme } = useUIStore();
  const { verifyOtp, register: registerUser, sendOtp } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const isWorker = role === 'worker';
  const accentColor = isWorker ? '#22c55e' : '#2563eb';
  const btnGradient = isWorker
    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
  const shadowGlow = isWorker
    ? '0 6px 20px rgba(34, 197, 94, 0.25)'
    : '0 6px 20px rgba(37, 99, 235, 0.25)';

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    setCanResend(true);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 4) {
      addToast('Enter 4-digit OTP', 'error');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'register') {
        await registerUser({
          name: regName,
          phone,
          city: regCity,
          area: regArea,
          role,
          otp,
          companyName: role === 'employer' ? regCompany : undefined,
        });
      } else {
        await verifyOtp(phone, otp, role);
      }

      setVerified(true);

      if (mode === 'register') {
        addToast('Account created! Complete your KYC to get started.', 'success');
        setTimeout(() => navigate('/kyc', { replace: true }), 1500);
      } else {
        addToast('Welcome back!', 'success');
        setTimeout(() => navigate('/home', { replace: true }), 1500);
      }
    } catch (err: any) {
      if (err?.data?.isNewUser) {
        addToast('No account found. Please register first.', 'error');
        setTimeout(() => navigate('/register'), 1500);
      } else {
        addToast(err instanceof Error ? err.message : 'Verification failed', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setCanResend(false);
    try {
      await sendOtp(phone);
      addToast('OTP resent to your phone', 'info');
    } catch {
      addToast('Failed to resend OTP', 'error');
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0F172A] px-6 transition-colors duration-300">
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.6, times: [0, 0.6, 1], ease: 'easeOut' }}
            className="absolute inset-0 bg-emerald-950/40 rounded-full blur-xl"
          />
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none" stroke="#22c55e" strokeWidth="5"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, ease: 'easeInOut' } },
              }}
            />
            <motion.path
              d="M32 50 L45 62 L68 38"
              fill="none" stroke="#22c55e" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, delay: 0.6, ease: 'easeOut' } },
              }}
            />
          </motion.svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            {mode === 'register' ? 'Account Created!' : 'Welcome Back!'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            {mode === 'register' ? 'Opening KYC verification…' : 'Redirecting to your dashboard…'}
          </p>
        </motion.div>
      </div>
    );
  }

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

      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: accentColor }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 pt-12 pb-6 z-10 max-w-md mx-auto w-full">
        {/* Navigation back */}
        <div className="mb-6 flex justify-start">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </div>

        {/* Card Wrapper */}
        <div className="bg-white/80 dark:bg-[#1e293b]/60 border border-slate-200 dark:border-slate-700/50 p-6 rounded-3xl shadow-card flex flex-col gap-6 backdrop-blur-md">
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verification Code</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              We sent a 4-digit OTP to your number
            </p>
            <p className="text-slate-900 dark:text-white font-extrabold text-sm mt-1">{phone}</p>
            <p className="text-xs text-amber-600 dark:text-amber-500/80 mt-2 font-bold bg-amber-50 dark:bg-[#0F172A]/40 py-1.5 px-3 rounded-xl border border-amber-200 dark:border-slate-800/80 inline-block">
              Use OTP: <span className="underline">1234</span>
            </p>
          </div>

          <div className="my-2">
            <OtpInput length={4} value={otp} onChange={setOtp} accent={isWorker ? 'green' : 'blue'} />
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={isLoading || otp.length < 4}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                background: btnGradient,
                boxShadow: shadowGlow,
              }}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Verify OTP'
              )}
            </motion.button>

            <div className="text-center mt-2">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-xs font-bold transition-all hover:underline"
                  style={{ color: accentColor }}
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-xs text-slate-500 font-bold">
                  Resend in <span style={{ color: accentColor }}>{timer}s</span>
                </p>
              )}
            </div>
          </div>
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
