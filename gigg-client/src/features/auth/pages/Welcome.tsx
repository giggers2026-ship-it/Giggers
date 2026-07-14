import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: '#01133b' }}>
      {/* BG decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #22C55E, transparent)', transform: 'translate(40%, -40%)' }} />
      <div className="absolute bottom-20 left-0 w-60 h-60 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #2563EB, transparent)', transform: 'translate(-40%, 0)' }} />
      <div className="absolute top-40 left-1/2 w-40 h-40 bg-white/5 rounded-full" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', duration: 0.8 }}>
          <img src="/logo.png" alt="Giggers" className="w-24 h-24 rounded-3xl shadow-2xl mb-6 mx-auto" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-3">Welcome to<br /><span className="text-white">Giggers</span><span style={{ color: '#22C55E' }}>.</span></h1>
          <p className="text-white/60 font-medium text-base max-w-xs">India's most trusted platform for temporary gig work.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full max-w-xs flex flex-col gap-4">
          <button
            onClick={() => navigate('/register')}
            className="w-full bg-white font-extrabold py-4 rounded-2xl flex items-center justify-between px-6 shadow-lg text-base"
            style={{ color: '#01133b' }}
          >
            <div className="flex items-center gap-3">
              <div className="text-left">
                <p className="font-extrabold text-lg">Get Started</p>
                <p className="text-xs text-slate-500 font-medium">Join the marketplace</p>
              </div>
            </div>
            <ArrowRight size={20} style={{ color: '#22C55E' }} />
          </button>

          <div className="text-center mt-4">
            <span className="text-white/50 text-sm font-medium">Already have an account? </span>
            <button onClick={() => navigate('/login')} className="text-white font-extrabold text-sm underline">Sign In</button>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center pb-8 z-10">
        <p className="text-white/30 text-xs font-medium">Trusted by 50,000+ workers across India 🇮🇳</p>
      </motion.div>
    </div>
  );
}
