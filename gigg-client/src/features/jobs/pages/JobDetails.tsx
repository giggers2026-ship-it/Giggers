import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Utensils, Shield, Bookmark, AlertCircle, Edit, Users, CheckCircle, Star, MessageCircle } from 'lucide-react';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button, Badge, MapPlaceholder, Modal, Chip, Avatar } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import type { Application } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import { useWalletStore } from '../../../store/walletStore';
import { useUIStore } from '../../../store/uiStore';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { jobs, myJobs, applications, savedJobIds, saveJob, unsaveJob, applyToJob, isLoading, completeJob, jobCandidates, fetchJobCandidates, hireWorker, fetchChatThreadId } = useJobStore();
  const { addToast } = useUIStore();
  const [applying, setApplying] = useState(false);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);

  const job = jobs.find(j => j.id === id);
  const isSaved = job ? savedJobIds.includes(job.id) : false;

  if (!job) return <div className="p-5 text-center">Job not found</div>;

  // A job is the employer's job if it matches my user ID
  const isEmployerForThisJob = user && job.employerId === user.id;
  const jobApplication = user?.role === 'worker'
    ? applications.find((a) => a.jobId === job.id)
    : undefined;
  const hasApplied = jobApplication !== undefined;
  const isHired = jobApplication?.status === 'hired';

  const handleApply = async () => {
    if (!user) return;
    setApplying(true);
    await applyToJob(job.id, user.id);
    setApplying(false);
    addToast('Successfully applied to job!', 'success');
    navigate('/jobs?tab=applications');
  };

  useEffect(() => {
    if (isEmployerForThisJob) {
      fetchJobCandidates(job.id);
    }
  }, [isEmployerForThisJob, job.id, fetchJobCandidates]);

  const handleHire = (applicationId: string) => {
    if (job.workersHired >= job.workersNeeded) {
      addToast(`You can only hire up to ${job.workersNeeded} workers.`, 'error');
      return;
    }
    hireWorker(job.id, applicationId);
    addToast('Worker hired successfully!', 'success');
  };

  return (
    <div className="pb-32 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader
        title="Job Details"
        showBack
        onBack={() => navigate(-1)}
        rightAction={
          !isEmployerForThisJob ? (
            user?.role !== 'employer' ? (
              <button onClick={() => isSaved ? unsaveJob(job.id) : saveJob(job.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-500">
                <Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-primary-500' : ''} />
              </button>
            ) : null
          ) : (
            <button onClick={() => {}} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-500">
              <Edit size={22} />
            </button>
          )
        }
      />

      <div className="bg-white dark:bg-dark-800 px-5 pt-6 pb-6 shadow-sm mb-2">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-3xl">
            {job.categoryEmoji}
          </div>
          {job.isUrgent && <Badge variant="danger" className="animate-pulse">🚨 URGENT</Badge>}
        </div>

        <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2">{job.title}</h1>

        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 mb-6">
          {job.isVerifiedEmployer && <Shield size={14} className="text-primary-500" />}
          <span>{job.employerName}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="text-amber-500 flex items-center gap-1">★ {job.employerRating}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800/30">
          <div>
            <p className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">Total Pay</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">₹{job.payPerWorker}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Openings Left</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{job.workersNeeded - job.workersHired} / {job.workersNeeded}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 bg-white dark:bg-dark-800 shadow-sm mb-2">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Time & Location</h3>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-600 flex items-center justify-center text-slate-500 flex-shrink-0"><Calendar size={18} /></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{job.date}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Report at {job.reportingTime}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-600 flex items-center justify-center text-slate-500 flex-shrink-0"><MapPin size={18} /></div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{job.location}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed pr-4">{job.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl overflow-hidden border border-slate-100 dark:border-dark-600">
          <MapPlaceholder height="h-32" />
          <div className="bg-slate-50 dark:bg-dark-700 p-3 text-center border-t border-slate-100 dark:border-dark-600">
            <button className="text-xs font-bold text-primary-600 dark:text-primary-400">Open in Maps →</button>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 bg-white dark:bg-dark-800 shadow-sm mb-2">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">Requirements & Details</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6 whitespace-pre-wrap">
          {job.description}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-dark-700 rounded-xl border border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-500 font-bold mb-1">Dress Code</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.dressCode}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-700 rounded-xl border border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-500 font-bold mb-1">Languages</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.languagesRequired.join(', ') || 'Any'}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-700 rounded-xl border border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-500 font-bold mb-1">Gender</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{job.genderPreference}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-700 rounded-xl border border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-500 font-bold mb-1">Payment</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{job.modeOfPayment}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-700 rounded-xl border border-slate-100 dark:border-dark-600">
            <p className="text-xs text-slate-500 font-bold mb-1">Facilities</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              {job.foodProvided ? <><Utensils size={14} /> Food</> : 'None'}
            </p>
          </div>
        </div>
        
        {job.dosAndDonts && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-bold mb-1">Do's & Don'ts</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
              {job.dosAndDonts}
            </p>
          </div>
        )}
        
        {job.clientName && (
          <div className="mt-4">
            <p className="text-xs text-slate-500 font-bold mb-1">Client Name</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{job.clientName}</p>
          </div>
        )}
      </div>

      {!isEmployerForThisJob && user?.role !== 'employer' && (
        <div className="px-5 py-6 bg-white dark:bg-dark-800 shadow-sm">
          <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
              By applying, you commit to arriving on time. Cancellations within 12 hours of reporting time may negatively impact your rating.
            </p>
          </div>
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
        {isEmployerForThisJob ? (
          <div className="flex gap-3">
            <Button className="flex-1" variant="outline" onClick={() => setShowCandidatesModal(true)} rightIcon={<Users size={18} />}>
              Candidates ({jobCandidates.length || job.applicantsCount})
            </Button>
            {job.status !== 'completed' ? (
              <Button className="flex-1" variant="primary" onClick={() => {
                  completeJob(job.id);
                  addToast('Job completed! Funds released to worker.', 'success');
              }} rightIcon={<CheckCircle size={18} />}>
                Complete Job
              </Button>
            ) : (
              <Button className="flex-1 bg-emerald-500 text-white" disabled>
                Completed
              </Button>
            )}
          </div>
        ) : user?.role === 'employer' ? (
          <div className="text-center py-2 text-sm font-bold text-slate-500 dark:text-slate-400">
            Employers cannot apply for gigs.
          </div>
        ) : isHired ? (
          <div className="flex flex-col gap-3">
            <Button fullWidth size="lg" disabled className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200">
              <CheckCircle size={18} className="mr-2" /> You're Hired!
            </Button>
            <Button
              fullWidth
              variant="outline"
              onClick={async () => {
                if (!user) return;
                const threadId = await fetchChatThreadId(job.id, user.id);
                if (threadId) navigate(`/chat/${threadId}`);
              }}
            >
              <MessageCircle size={18} className="mr-2" /> Chat with Employer
            </Button>
          </div>
        ) : hasApplied ? (
          <div className="flex flex-col gap-3">
            <Button fullWidth size="lg" disabled className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200">
              <CheckCircle size={18} className="mr-2" /> Waiting for Approval
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {!user?.isApproved && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-3 rounded-xl flex items-center gap-2">
                <Shield size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Your account is pending admin approval before you can apply.</p>
              </div>
            )}
            {user?.isApproved && !user?.isVerified && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-3 rounded-xl flex items-center gap-2">
                <Shield size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">KYC Verification required to apply for jobs. Go to Profile to verify.</p>
              </div>
            )}
            <Button
              fullWidth
              size="lg"
              loading={applying || isLoading}
              onClick={handleApply}
              disabled={!user?.isApproved || !user?.isVerified}
            >
              {!user?.isApproved ? 'Account Pending Approval' : !user?.isVerified ? 'Verify Identity to Apply' : `Apply for ₹${job.payPerWorker}`}
            </Button>
          </div>
        )}
      </div>

      {/* Candidates Modal */}
      <Modal open={showCandidatesModal} onClose={() => setShowCandidatesModal(false)} title="Job Candidates">
        <div className="flex flex-col gap-4 py-2">
          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-xl p-3 flex justify-between items-center border border-primary-100 dark:border-primary-800/30">
            <span className="text-sm font-bold text-primary-700 dark:text-primary-400">Hiring Progress</span>
            <span className="text-sm font-black text-primary-600">{job.workersHired} / {job.workersNeeded} Hired</span>
          </div>
          
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
            {jobCandidates.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No candidates have applied yet.</p>
            ) : (
              jobCandidates.map(c => (
                <div key={c.id} className="bg-white dark:bg-dark-800 p-3 rounded-2xl border border-slate-100 dark:border-dark-600 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                      <Avatar src={c.workerProfile?.selfie} name={c.workerName} size="md" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                          {c.workerName} 
                        </h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 mt-1">
                          <Star size={12} fill="currentColor" /> {c.workerRating}
                          {c.workerProfile && <span className="text-slate-400 font-medium ml-1">• {c.workerProfile.completedJobs} jobs</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.status === 'accepted' ? (
                        <>
                          <Badge variant="success">Hired</Badge>
                          <button
                            onClick={async () => {
                              const threadId = await fetchChatThreadId(job.id, c.workerId);
                              if (threadId) { setShowCandidatesModal(false); navigate(`/chat/${threadId}`); }
                            }}
                            className="text-[10px] font-bold text-primary-600 flex items-center gap-1"
                          >
                            <MessageCircle size={12} /> Chat
                          </button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleHire(c.id)} disabled={job.workersHired >= job.workersNeeded}>
                          Hire
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Worker Profile Modal */}
      {selectedCandidate && selectedCandidate.workerProfile && (
        <Modal open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} title="Worker Profile">
          <div className="flex flex-col gap-5 py-2">
            <div className="flex items-center gap-4">
              <Avatar src={selectedCandidate.workerProfile?.selfie} name={selectedCandidate.workerName} size="xl" />
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{selectedCandidate.workerName}</h3>
                <p className="text-sm font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin size={14} /> {selectedCandidate.workerProfile.city}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="warning" className="flex gap-1 items-center">
                    <Star size={12} fill="currentColor" /> {selectedCandidate.workerRating}
                  </Badge>
                  <Badge variant="success">{selectedCandidate.workerProfile.attendanceRate}% Attendance</Badge>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-dark-800 p-4 rounded-2xl border border-slate-100 dark:border-dark-600">
              <p className="text-xs font-bold text-slate-500 mb-2">About</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCandidate.workerProfile.bio}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-dark-800 p-3 rounded-xl border border-slate-100 dark:border-dark-600">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{selectedCandidate.workerProfile.age} • {selectedCandidate.workerProfile.gender}</p>
                </div>
                <div className="bg-slate-50 dark:bg-dark-800 p-3 rounded-xl border border-slate-100 dark:border-dark-600">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Languages</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCandidate.workerProfile.languages?.join(', ')}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Top Skills</p>
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.workerProfile.skills?.map(skill => (
                  <Chip key={skill} active={false}>{skill}</Chip>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => { handleHire(selectedCandidate.id); setSelectedCandidate(null); }} disabled={selectedCandidate.status === 'accepted' || job.workersHired >= job.workersNeeded}>
              {selectedCandidate.status === 'accepted' ? 'Already Hired' : 'Hire this Worker'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
