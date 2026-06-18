import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useJobStore } from '../store/jobStore';
import { useUIStore } from '../store/uiStore';
import { HomeHeader } from '../components/layout/Navigation';
import { JobCard } from '../components/shared/Cards';
import { Shield, AlertCircle } from 'lucide-react';

export default function Home() {
  const { user } = useAuthStore();
  const { jobs, featuredJobs, myJobs, fetchJobs, fetchPostedJobs, isLoading } = useJobStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  // Real category counts from Supabase
  const cateringCount = jobs.filter(j => j.category === 'Catering').length;
  const pamphletsCount = jobs.filter(j => j.category === 'Pamphlet Dist.').length;

  useEffect(() => {
    fetchJobs();
    if (user && user.role === 'employer') {
      fetchPostedJobs(user.id);
    }
  }, [fetchJobs, fetchPostedJobs, user]);

  if (!user) return null;

  return (
    <div className="pb-24 bg-slate-50 dark:bg-dark-900 min-h-screen">
      <HomeHeader
        name={user.name}
        city={user.city}
        avatar={user.selfie}
      />

      {user.role === 'employer' ? (
        <div className="px-5 mt-2 relative z-10 flex flex-col gap-6">
          {/* KYC Notification */}
          {user && !user.isVerified && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-2"
            >
              <div 
                onClick={() => navigate('/profile')}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                  <Shield size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-amber-900 dark:text-amber-300">Verify Identity</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-500 font-medium">Complete Aadhaar KYC to start posting job requirements.</p>
                </div>
                <AlertCircle size={18} className="text-amber-500" />
              </div>
            </motion.div>
          )}

          {/* Stats Row */}
          <div className="flex gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-white dark:bg-dark-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-600 flex flex-col items-center justify-center text-center"
            >
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Total Job Postings</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{myJobs.length}</h3>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 bg-white dark:bg-dark-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-600 flex flex-col items-center justify-center text-center"
            >
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Workers Hired</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {myJobs.reduce((acc, job) => acc + (job.workersHired || 0), 0)}
              </h3>
            </motion.div>
          </div>

          {/* Post a Job CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/post-job')}
            className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg shadow-primary-500/20 cursor-pointer relative overflow-hidden flex items-center justify-between border border-primary-500"
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
            <div className="z-10 flex-1 pr-4">
              <h3 className="text-lg font-black mb-1">Need Extra Helpers? ⚡</h3>
              <p className="text-xs text-white/80 font-medium leading-relaxed">Post catering or pamphlet distribution gigs and hire local workers in minutes.</p>
            </div>
            <div className="w-11 h-11 bg-white text-primary-700 rounded-full flex items-center justify-center shadow-md flex-shrink-0 font-extrabold text-lg">
              +
            </div>
          </motion.div>

          {/* Recent Job Postings list */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">My Posted Gigs</h2>
              <button onClick={() => navigate('/jobs?tab=postings')} className="text-sm font-bold text-primary-600">See All</button>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading ? (
                <p className="text-slate-500 text-sm">Loading postings...</p>
              ) : myJobs.length > 0 ? (
                myJobs.slice(0, 3).map((job) => (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}>
                    <JobCard job={job} />
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-600 rounded-2xl p-6 text-center shadow-sm">
                  <span className="text-3xl block mb-2">📋</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">No active postings yet</p>
                  <p className="text-xs text-slate-500 mt-1">Click the card above to create your first gig posting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="px-5 mt-2 relative z-10">
            {user && !user.isVerified && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mb-4"
              >
                <div 
                  onClick={() => navigate('/profile')}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Shield size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold text-amber-900 dark:text-amber-300">Complete KYC</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-500 font-medium">Verify Aadhaar & Selfie to start applying for jobs.</p>
                  </div>
                  <AlertCircle size={18} className="text-amber-500" />
                </div>
              </motion.div>
            )}

            <div className="flex gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white dark:bg-dark-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-600 flex flex-col items-center justify-center text-center"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Today's Earnings</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">₹0</h3>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 bg-white dark:bg-dark-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-dark-600 flex flex-col items-center justify-center text-center"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Jobs Completed</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">0</h3>
              </motion.div>
            </div>
          </div>

          <div className="px-5 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Nearby Jobs Available</h2>
              <button onClick={() => navigate('/jobs')} className="text-sm font-bold text-primary-600">See All</button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar -mx-5 px-5">
              {isLoading ? (
                <p className="text-slate-500">Loading jobs...</p>
              ) : featuredJobs.length > 0 ? (
                featuredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="snap-center min-w-[200px] bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-card border border-slate-100 dark:border-dark-600 flex flex-col"
                  >
                    <div onClick={() => navigate(`/jobs/${job.id}`)} className="cursor-pointer flex-1">
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mb-1">{job.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2">📍 {job.location}</p>
                      <div className="font-black text-slate-900 dark:text-white mb-3">₹{job.payPerWorker}<span className="text-[10px] text-slate-400 font-bold">/day</span></div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}`); }} 
                        className="flex-1 bg-primary-600 text-white text-xs font-extrabold py-2 px-3 rounded-xl shadow-[0_4px_12px_rgba(26,115,232,0.3)] hover:bg-primary-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToast('Job rejected', 'success'); }} 
                        className="flex-1 bg-slate-100 dark:bg-dark-600 text-slate-700 dark:text-slate-300 text-xs font-extrabold py-2 px-3 rounded-xl hover:bg-slate-200 dark:hover:bg-dark-500 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500 text-sm font-medium">No nearby jobs available right now.</p>
              )}
            </div>
          
            <div className="px-5 mt-6">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Work Categories</h2>
              <div className="grid grid-cols-2 gap-3">

                {/* ── CATERING CARD — Animated 2D Guy ── */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/jobs?category=Catering')}
                  className="relative overflow-hidden text-left aspect-square flex flex-col justify-end rounded-2xl bg-[#fbbf24]"
                  style={{ border: '3px solid #f59e0b' }}
                >
                  {/* Dotted texture background */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, #ffffff 2px, transparent 0)', backgroundSize: '20px 20px' }} />

                  {/* 2D Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src="/images/catering_guy.png" alt="Catering" className="w-full h-full object-contain" />
                  </div>

                  <div className="relative z-10 px-3 pb-3 w-full bg-gradient-to-t from-amber-600/60 to-transparent pt-10">
                    <p className="text-sm font-extrabold text-white leading-tight">Catering</p>
                    <p className="text-[10px] font-bold text-amber-50">{cateringCount} open gigs</p>
                  </div>
                </motion.button>

                {/* ── PAMPHLET CARD — Catchy Green without Glow ── */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/jobs?category=Pamphlet+Dist.')}
                  className="relative overflow-hidden text-left aspect-square flex flex-col justify-end rounded-2xl bg-emerald-400"
                  style={{ border: '3px solid #10b981' }}
                >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff), linear-gradient(45deg, #ffffff 25%, transparent 25%, transparent 75%, #ffffff 75%, #ffffff)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />

                  {/* 2D Image */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img src="/images/pamphlet_distributor.png" alt="Pamphlet Distribution" className="w-full h-full object-contain" />
                  </div>

                  <div className="relative z-10 px-3 pb-3 w-full bg-gradient-to-t from-emerald-600/60 to-transparent pt-10">
                    <p className="text-sm font-extrabold text-white leading-tight">Pamphlet Dist.</p>
                    <p className="text-[10px] font-bold text-emerald-50">{pamphletsCount} open gigs</p>
                  </div>
                </motion.button>

              </div>
            </div>
          </div>
        </>
      )}
    </div>


  );
}
