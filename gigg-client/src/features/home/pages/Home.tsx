import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';
import { useWalletStore } from '../../../store/walletStore';
import { useUIStore } from '../../../store/uiStore';
import { HomeHeader } from '../../../components/layout/Navigation';
import { JobCard } from '../../../components/shared/Cards';
import { Shield, AlertCircle, Plus, ArrowRight } from 'lucide-react';

/* ── Fade-up stagger helper ── */
const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const { user } = useAuthStore();
  const { jobs, featuredJobs, myJobs, fetchJobs, fetchPostedJobs, isLoading } = useJobStore();
  const { wallet, fetchWallet } = useWalletStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const cateringCount  = jobs.filter(j => j.category === 'Catering').length;
  const pamphletsCount = jobs.filter(j => j.category === 'Pamphlet Dist.').length;

  useEffect(() => {
    fetchJobs();
    if (user?.role === 'employer') {
      fetchPostedJobs(user.id);
    } else if (user?.role === 'worker') {
      fetchWallet();
    }
  }, [fetchJobs, fetchPostedJobs, fetchWallet, user]);

  if (!user) return null;

  const isWorker = user.role === 'worker';

  // Employer Overview statistics
  const totalPosted = myJobs.length;
  const totalApplicants = myJobs.reduce((acc, j) => acc + (j.applicantsCount || 0), 0);
  const inProgress = myJobs.filter(j => j.status === 'active').length;
  const completed = myJobs.filter(j => j.status === 'completed').length;

  return (
    <div className="pb-28 bg-[#0F172A] min-h-screen font-sans">
      {/* ── Top header ── */}
      <HomeHeader name={user.name} city={user.city} avatar={user.selfie} />

      {/* ── KYC banner ── */}
      {!user.isVerified && (
        <div className="px-5 mt-5">
          <FadeUp>
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-4 p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 hover:opacity-90"
              style={{
                background: 'rgba(245,158,11,0.08)',
                borderColor: 'rgba(245,158,11,0.25)',
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Shield size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  {isWorker ? 'Complete KYC' : 'Verify Identity'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">
                  {isWorker
                    ? 'Verify Aadhaar & Selfie to start applying for jobs.'
                    : 'Complete Aadhaar KYC to start posting job requirements.'}
                </p>
              </div>
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            </div>
          </FadeUp>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          EMPLOYER VIEW
      ══════════════════════════════════════════════════════ */}
      {user.role === 'employer' ? (
        <div className="px-5 mt-5 flex flex-col gap-6">
          
          {/* Blue Gradient Overview Stats Card */}
          <FadeUp delay={0.05}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-500/20">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-extrabold text-white/70 uppercase tracking-widest">Overview</h3>
                  <div className="text-[10px] bg-white/15 border border-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-wider">This Week</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-2xl font-black">{totalPosted}</p>
                    <p className="text-[8px] font-extrabold text-slate-300/80 mt-1.5 uppercase tracking-wider leading-tight">Jobs Posted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{totalApplicants}</p>
                    <p className="text-[8px] font-extrabold text-slate-300/80 mt-1.5 uppercase tracking-wider leading-tight">Applications</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{inProgress}</p>
                    <p className="text-[8px] font-extrabold text-slate-300/80 mt-1.5 uppercase tracking-wider leading-tight">In Progress</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black">{completed}</p>
                    <p className="text-[8px] font-extrabold text-slate-300/80 mt-1.5 uppercase tracking-wider leading-tight">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Post a Job CTA Card */}
          <FadeUp delay={0.1}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/post-job')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl p-6 cursor-pointer flex items-center justify-between shadow-lg shadow-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
              <div className="z-10 flex-1 pr-6">
                <p className="text-[10px] font-black text-white/70 uppercase tracking-wider mb-1">New Posting</p>
                <h3 className="text-lg font-black text-white mb-1">Need Extra Helpers? ⚡</h3>
                <p className="text-white/75 text-xs font-medium leading-relaxed">
                  Post catering or pamphlet distribution gigs and hire local workers in minutes.
                </p>
              </div>
              <div className="w-11 h-11 bg-white text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-card-md">
                <Plus size={20} strokeWidth={3} />
              </div>
            </motion.div>
          </FadeUp>

          {/* Recent postings */}
          <FadeUp delay={0.15}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">My Posted Gigs</h2>
              <button
                onClick={() => navigate('/jobs?tab=postings')}
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                See All <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-[#1e293b]/40 border border-slate-800 skeleton animate-pulse" />)}
                </div>
              ) : myJobs.length > 0 ? (
                myJobs.slice(0, 3).map(job => (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}>
                    <JobCard job={job} />
                  </div>
                ))
              ) : (
                <div className="bg-[#1e293b]/40 border border-slate-800/80 rounded-3xl p-8 text-center backdrop-blur-sm">
                  <span className="text-4xl block mb-3">📋</span>
                  <p className="text-sm font-bold text-white">No active postings yet</p>
                  <p className="text-xs text-slate-500 mt-1">Click the button above to create your first gig.</p>
                </div>
              )}
            </div>
          </FadeUp>
        </div>

      /* ══════════════════════════════════════════════════════
          WORKER VIEW
      ══════════════════════════════════════════════════════ */
      ) : (
        <div className="px-5 mt-5 flex flex-col gap-6">

          {/* Green Gradient Wallet Balance Card */}
          <FadeUp delay={0.05}>
            <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-green-500/20">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">Wallet Balance</p>
                    <h2 className="text-3xl font-black mt-1.5">₹{(wallet?.currentBalance ?? 3450).toLocaleString('en-IN')}</h2>
                  </div>
                  <button
                    onClick={() => navigate('/wallet')}
                    className="bg-white text-green-700 font-extrabold text-xs px-4.5 py-2.5 rounded-2xl shadow-md transition-all active:scale-95 hover:bg-slate-50"
                  >
                    Withdraw
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-white/10 mt-1">
                  <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Total Earnings</p>
                    <p className="text-base font-black mt-0.5">₹{(user.totalEarnings || 18650).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Jobs Completed</p>
                    <p className="text-base font-black mt-0.5">{user.completedJobs || 24}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Available Jobs section */}
          <FadeUp delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Nearby Jobs Available</h2>
              <button
                onClick={() => navigate('/jobs')}
                className="text-xs font-bold text-green-400 hover:underline flex items-center gap-1"
              >
                See All <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-5 px-5">
              {isLoading ? (
                <div className="flex gap-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex-shrink-0 w-56 h-44 rounded-3xl bg-[#1e293b]/40 border border-slate-800 skeleton animate-pulse" />
                  ))}
                </div>
              ) : featuredJobs.length > 0 ? (
                featuredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="snap-center flex-shrink-0 w-56 bg-white border border-slate-100/80 rounded-3xl p-5 flex flex-col shadow-card text-slate-900 animate-fade-up"
                  >
                    <div onClick={() => navigate(`/jobs/${job.id}`)} className="cursor-pointer flex-1 flex flex-col">
                      <div className="text-3xl mb-2.5">{job.categoryEmoji}</div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight mb-1 line-clamp-2">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mb-3 flex items-center gap-1 mt-0.5">
                        📍 {job.location}
                      </p>
                      <div className="font-black text-green-600 text-lg mt-auto">
                        ₹{job.payPerWorker}
                        <span className="text-[10px] text-slate-400 font-bold">/day</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4.5">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }}
                        className="flex-1 text-white text-xs font-extrabold py-2 px-3 rounded-xl transition-all duration-200 active:scale-95"
                        style={{ background: '#22c55e', boxShadow: '0 4px 12px rgba(34,197,94,0.25)' }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); addToast('Job rejected', 'success'); }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-extrabold py-2 px-3 rounded-xl transition-all"
                      >
                        Skip
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 text-sm font-medium py-4 px-2">No nearby jobs available right now.</p>
              )}
            </div>
          </FadeUp>

          {/* Work categories */}
          <FadeUp delay={0.15}>
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Work Categories</h2>
            <div className="grid grid-cols-2 gap-4">

              {/* Catering */}
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/jobs?category=Catering')}
                className="relative overflow-hidden text-left rounded-3xl aspect-square flex flex-col justify-end border border-amber-500/20 shadow-md"
                style={{ background: 'linear-gradient(160deg, #78350f 0%, #1c0a00 100%)' }}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 12px 12px, #ffffff 2px, transparent 0)', backgroundSize: '22px 22px' }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img src="/images/catering_guy.png" alt="Catering" className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10 px-4 pb-4 pt-10 w-full" style={{ background: 'linear-gradient(to top, rgba(28,10,0,0.95) 0%, transparent 100%)' }}>
                  <p className="text-sm font-extrabold text-white leading-tight">Catering</p>
                  <p className="text-[10px] font-bold text-amber-200/80 mt-0.5">{cateringCount} open gigs</p>
                </div>
              </motion.button>

              {/* Pamphlet Distribution */}
              <motion.button
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/jobs?category=Pamphlet+Dist.')}
                className="relative overflow-hidden text-left rounded-3xl aspect-square flex flex-col justify-end border border-green-500/20 shadow-md"
                style={{ background: 'linear-gradient(160deg, #14532d 0%, #052e16 100%)' }}
              >
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.5) 75%), linear-gradient(45deg, rgba(255,255,255,0.5) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.5) 75%)', backgroundPosition: '0 0, 11px 11px', backgroundSize: '22px 22px' }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img src="/images/pamphlet_distributor.png" alt="Pamphlet Distribution" className="w-full h-full object-contain" />
                </div>
                <div className="relative z-10 px-4 pb-4 pt-10 w-full" style={{ background: 'linear-gradient(to top, rgba(5,46,22,0.95) 0%, transparent 100%)' }}>
                  <p className="text-sm font-extrabold text-white leading-tight">Pamphlet Dist.</p>
                  <p className="text-[10px] font-bold text-green-200/80 mt-0.5">{pamphletsCount} open gigs</p>
                </div>
              </motion.button>

            </div>
          </FadeUp>
        </div>
      )}
    </div>
  );
}
