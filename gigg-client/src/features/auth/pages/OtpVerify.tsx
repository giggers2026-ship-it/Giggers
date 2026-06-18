import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, OtpInput } from '../../../components/ui';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';

export default function OtpVerify() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const phone = params.get('phone') || '';
  const role = (params.get('role') || 'worker') as 'worker' | 'employer';
  const mode = params.get('mode') || 'login'; // 'login' or 'register'
  // Register fields passed via URL params
  const regName = params.get('name') || '';
  const regCity = params.get('city') || 'Mumbai';
  const regArea = params.get('area') || '';
  const regCompany = params.get('companyName') || '';

  const { addToast } = useUIStore();
  const { verifyOtp, register: registerUser, sendOtp } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const t = setTimeout(() => setTimer(s => s - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 4) { addToast('Enter 4-digit OTP', 'error'); return; }
    setIsLoading(true);

    try {
      // verifyOtp signs in via Supabase and fetches/creates the profile
      const success = await verifyOtp(phone, otp, role);

      if (success) {
        // For registration mode, also upsert the extended profile data
        if (mode === 'register') {
          await registerUser({
            name: regName,
            phone,
            city: regCity,
            area: regArea,
            role,
            companyName: role === 'employer' ? regCompany : undefined,
          });
        }

        setVerified(true);
        addToast(mode === 'register' ? 'Account created successfully 🎉' : 'Welcome back! 👋', 'success');
        setTimeout(() => navigate('/home'), 1800);
      } else {
        addToast('Invalid OTP. Please check your SMS.', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(30);
    setCanResend(false);
    try {
      await sendOtp(phone);
      addToast('OTP resent to your phone 📲', 'info');
    } catch {
      addToast('Failed to resend OTP', 'error');
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-900 px-6">
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: 1 }}
            transition={{ duration: 0.6, times: [0, 0.6, 1], ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/30 rounded-full blur-xl"
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
              fill="none" stroke="#10b981" strokeWidth="5"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } }
              }}
            />
            <motion.path
              d="M32 50 L45 62 L68 38"
              fill="none" stroke="#10b981" strokeWidth="6"
              strokeLinecap="round" strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1, transition: { duration: 0.4, delay: 0.6, ease: "easeOut" } }
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
            Authentication Complete
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex flex-col">
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 px-5 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-6"
        >
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-3xl font-black text-white mb-2">Enter OTP 🔐</h1>
        <p className="text-white/70 font-medium">Sent to {phone}</p>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-1 bg-white dark:bg-dark-900 rounded-t-3xl -mt-8 px-6 pt-10 pb-6 z-10"
      >
        <div className="text-center mb-8">
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-2">
            We sent a 4-digit code to
          </p>
          <p className="text-base font-extrabold text-slate-900 dark:text-white">{phone}</p>
          {phone === '9999999999' || phone === '+919999999999' ? (
            <p className="text-xs text-amber-600 mt-2 font-bold">Mock OTP is 1234</p>
          ) : (
            <p className="text-xs text-slate-400 mt-1 font-medium">Check your SMS inbox</p>
          )}
        </div>

        <OtpInput length={4} value={otp} onChange={setOtp} />

        <div className="mt-8 flex flex-col gap-3">
          <Button fullWidth size="lg" loading={isLoading} onClick={handleVerify}>
            Verify OTP
          </Button>
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm font-bold text-primary-600 dark:text-primary-400"
              >
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Resend in <span className="font-extrabold text-primary-600">{timer}s</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
