import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Briefcase, FileText, Activity, Compass, MessageCircle, ShieldAlert, MapPin, Check, X as XIcon } from 'lucide-react';
import { AppHeader } from '../../../components/layout/Navigation';
import { JobCard } from '../../../components/shared/Cards';
import { Button, Input, Modal, Chip, Skeleton, Toggle, Badge } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';

export default function Jobs() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuthStore();
  const { jobs, myJobs, applications, fetchJobs, fetchPostedJobs, fetchAppliedJobs, fetchChatThreadId, isLoading, savedJobIds, saveJob, unsaveJob, confirmHire, declineHire } = useJobStore();
  const { addToast } = useUIStore();
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'explore' | 'postings' | 'applications' | 'ongoing'>(() => {
    const tabParam = params.get('tab');
    if (user?.role === 'employer') {
      if (tabParam === 'ongoing' || tabParam === 'postings') return tabParam as any;
      return 'postings';
    } else {
      if (tabParam === 'explore' || tabParam === 'applications' || tabParam === 'ongoing') return tabParam as any;
      return 'explore';
    }
  });

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState(params.get('category') || 'All');
  const [activeSort, setActiveSort] = useState('recent');
  const [urgentOnly, setUrgentOnly] = useState(params.get('filter') === 'urgent');
  const [locationFilter, setLocationFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<'any' | 'male' | 'female'>('any');

  // Enforce role-based tab access
  useEffect(() => {
    if (user) {
      if (user.role === 'employer') {
        if (activeTab !== 'postings' && activeTab !== 'ongoing') {
          setActiveTab('postings');
        }
      } else {
        if (activeTab !== 'explore' && activeTab !== 'applications' && activeTab !== 'ongoing') {
          setActiveTab('explore');
        }
      }
    }
  }, [user, activeTab]);

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchPostedJobs(user.id);
      fetchAppliedJobs(user.id);
    }
  }, [fetchJobs, fetchPostedJobs, fetchAppliedJobs, user]);

  const filteredExploreJobs = jobs.filter(j => {
    // Hide jobs posted by current user or jobs already applied for
    if (user && j.employerId === user.id) return false;
    if (user && applications.some(a => a.jobId === j.id)) return false;
    
    if (activeCategory !== 'All' && j.category !== activeCategory) return false;
    if (urgentOnly && !j.isUrgent) return false;
    if (locationFilter && !j.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
    if (genderFilter !== 'any' && j.genderPreference !== 'any' && j.genderPreference !== genderFilter) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.employerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingConfirmation = applications.filter(a => a.status === 'hired');
  const confirmedOngoing = applications.filter(a => a.status === 'confirmed');

  const ongoingJobs = [
    ...myJobs.filter(j => j.status === 'active'),
    ...confirmedOngoing.map(a => a.job)
  ];

  const visibleTabs = user?.role === 'employer'
    ? [
        { id: 'postings', label: 'Postings', icon: Briefcase },
        { id: 'ongoing', label: 'Ongoing', icon: Activity },
      ]
    : [
        { id: 'explore', label: 'Explore', icon: Compass },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'ongoing', label: 'Ongoing', icon: Activity },
      ];

  const kycIncomplete = user && !user.isApproved && (user.kycStatus === 'not_started' || user.kycStatus === 'rejected');

  if (kycIncomplete) {
    return (
      <div className="pb-24 bg-slate-50 dark:bg-dark-900 min-h-screen">
        <AppHeader title="Jobs Hub" />
        <div className="px-5 pt-16 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <ShieldAlert size={36} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">KYC Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Complete your Aadhaar KYC verification to browse and apply for jobs or post gigs.
          </p>
          <button onClick={() => navigate('/kyc')}
            className="mt-2 bg-primary-600 text-white font-extrabold text-sm px-8 py-3 rounded-2xl shadow-lg shadow-primary-500/30">
            Complete KYC Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Jobs Hub" />

      {/* Tabs */}
      <div className="sticky top-[60px] z-30 bg-white dark:bg-dark-800 border-b border-slate-100 dark:border-dark-600 px-2 pt-2 shadow-sm">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {visibleTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] py-3 text-xs font-bold flex flex-col items-center justify-center gap-1 border-b-2 transition-all ${
                activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div key="explore" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
              {/* Search and Filters Bar */}
              <div className="flex items-center gap-3 mb-1">
                <Input
                  placeholder="Search jobs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  leftIcon={<Search size={18} />}
                  className="flex-1"
                />
                <button
                  onClick={() => setShowFilters(true)}
                  className="w-11 h-11 bg-slate-100 dark:bg-dark-600 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-300 relative flex-shrink-0"
                >
                  <Filter size={18} />
                  {(activeCategory !== 'All' || urgentOnly || locationFilter || genderFilter !== 'any') && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white dark:border-dark-600" />}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <Chip active={activeCategory === 'All'} onClick={() => setActiveCategory('All')}>All</Chip>
                <Chip active={urgentOnly} onClick={() => setUrgentOnly(!urgentOnly)}>🚨 Urgent</Chip>
                <Chip active={activeCategory === 'Catering'} onClick={() => setActiveCategory('Catering')}>👨‍🍳 Catering</Chip>
                <Chip active={activeCategory === 'Pamphlet Dist.'} onClick={() => setActiveCategory('Pamphlet Dist.')}>📄 Pamphlet Dist.</Chip>
              </div>

              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-dark-800 p-4 rounded-2xl flex gap-3 border border-slate-100 dark:border-dark-600"><Skeleton className="w-12 h-12" /><div className="flex-1"><Skeleton className="h-4 w-3/4 mb-2" /><Skeleton className="h-3 w-1/2 mb-3" /><Skeleton className="h-4 w-1/4" /></div></div>
                ))
              ) : filteredExploreJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExploreJobs.map((job, i) => (
                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <JobCard job={job} onClick={() => navigate(`/jobs/${job.id}`)} saved={savedJobIds.includes(job.id)} onSave={() => savedJobIds.includes(job.id) ? unsaveJob(job.id) : saveJob(job.id)} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No jobs found</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'postings' && (
            <motion.div key="postings" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-slate-500 text-center py-8">Loading postings...</p>
              ) : myJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myJobs.map((job) => <JobCard key={job.id} job={job} onClick={() => navigate(`/assign-work/${job.id}`)} />)}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-600 shadow-sm">
                  <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase size={24} className="text-primary-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Active Postings</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto mb-6">You haven't posted any jobs yet. Need some extra hands?</p>
                  <button onClick={() => navigate('/post-job')} className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/30">Post a Job Now</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-slate-500 text-center py-8">Loading applications...</p>
              ) : applications.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-600">
                      <div className="flex justify-between items-start mb-3 cursor-pointer" onClick={() => navigate(`/jobs/${app.jobId}`)}>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{app.job.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{app.job.employerName}</p>
                        </div>
                        <div className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg ${
                          app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          app.status === 'hired' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          app.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {app.status === 'hired' ? 'Action Required' : app.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-dark-700 p-2.5 rounded-xl mb-3">
                        <span>{app.job.date}</span>
                        <span className="font-black text-slate-900 dark:text-white">₹{app.job.payPerWorker}</span>
                      </div>
                      {app.status === 'confirmed' && user && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/worker-pipeline/${app.jobId}`)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Track Job
                          </button>
                          <button
                            onClick={async () => {
                              const threadId = await fetchChatThreadId(app.jobId, user.id);
                              if (threadId) navigate(`/chat/${threadId}`);
                            }}
                            className="w-10 flex items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-800/30"
                          >
                            <MessageCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-600 shadow-sm">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={24} className="text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Applications</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto mb-6">You haven't applied to any jobs yet. Explore available gigs.</p>
                  <button onClick={() => setActiveTab('explore')} className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30">Find Gigs</button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'ongoing' && (
            <motion.div key="ongoing" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
              {isLoading ? (
                <p className="text-slate-500 text-center py-8">Loading ongoing jobs...</p>
              ) : (ongoingJobs.length > 0 || pendingConfirmation.length > 0) ? (
                <>
                  {user?.role !== 'employer' && pendingConfirmation.length > 0 && (
                    <div className="flex flex-col gap-3 mb-2">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Awaiting Your Confirmation</h4>
                      {pendingConfirmation.map((app) => (
                        <div key={app.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-blue-200 dark:border-blue-800/40">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white">{app.job.title}</h4>
                              <p className="text-xs text-slate-500 mt-1">{app.job.employerName}</p>
                            </div>
                            <Badge variant="primary">Action Required</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-dark-700 p-2.5 rounded-xl mb-3">
                            <span>{app.job.date}</span>
                            <span>{app.job.reportingTime}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              fullWidth
                              loading={actioningId === app.id}
                              leftIcon={<Check size={16} />}
                              onClick={async () => {
                                setActioningId(app.id);
                                try {
                                  await confirmHire(app.id);
                                  addToast('Job confirmed!', 'success');
                                } catch {
                                  addToast('Failed to confirm', 'error');
                                } finally {
                                  setActioningId(null);
                                }
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800/40 dark:hover:bg-red-900/20"
                              loading={actioningId === app.id}
                              leftIcon={<XIcon size={16} />}
                              onClick={async () => {
                                setActioningId(app.id);
                                try {
                                  await declineHire(app.id);
                                  addToast('Offer declined', 'info');
                                } catch {
                                  addToast('Failed to decline', 'error');
                                } finally {
                                  setActioningId(null);
                                }
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {ongoingJobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ongoingJobs.map((job) => (
                        <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-2xl border border-slate-100 dark:border-dark-600 shadow-sm">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity size={24} className="text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Ongoing Jobs</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] mx-auto mb-6">You have no active or ongoing jobs right now.</p>
                  <button onClick={() => setActiveTab('explore')} className="px-6 py-2.5 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30">Find Gigs</button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Sort By</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'recent', label: 'Most Recent' },
                { id: 'pay_high', label: 'Highest Pay' },
                { id: 'distance', label: 'Nearest to me' },
                { id: 'urgent', label: 'Urgent First' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSort(s.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${activeSort === s.id ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600' : 'border-slate-200 dark:border-dark-500 text-slate-600 dark:text-slate-400'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-dark-500" />
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Location</p>
            <Input placeholder="e.g. Andheri West" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} leftIcon={<MapPin size={16} />} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-white mb-3">Gender Preference</p>
            <div className="grid grid-cols-3 gap-2">
              {(['any', 'male', 'female'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all capitalize ${genderFilter === g ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-600' : 'border-slate-200 dark:border-dark-500 text-slate-600 dark:text-slate-400'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-slate-100 dark:bg-dark-500" />
          <div className="flex flex-col gap-4">
            <Toggle checked={urgentOnly} onChange={setUrgentOnly} label="Urgent Requirements Only" />
            <Toggle checked={false} onChange={() => {}} label="Verified Employers Only" />
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" fullWidth onClick={() => { setActiveCategory('All'); setUrgentOnly(false); setActiveSort('recent'); setLocationFilter(''); setGenderFilter('any'); }}>Reset</Button>
            <Button fullWidth onClick={() => setShowFilters(false)}>Apply Filters</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
