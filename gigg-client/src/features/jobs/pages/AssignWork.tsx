import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { CheckCircle2, UserCircle2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function AssignWork() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { myJobs, jobCandidates, fetchJobCandidates, hireWorker, isLoading } = useJobStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed'>('pending');
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [isHiring, setIsHiring] = useState(false);

  const job = myJobs.find(j => j.id === id);

  useEffect(() => {
    if (id) {
      fetchJobCandidates(id);
    }
  }, [id, fetchJobCandidates]);

  if (!job) {
    return <div className="p-5 text-center mt-20 font-bold dark:text-white">Job not found.</div>;
  }

  const pendingWorkers = jobCandidates.filter(c => c.status === 'applied');
  const confirmedWorkers = jobCandidates.filter(c => c.status === 'hired' || c.status === 'completed');

  const handleToggleSelection = (applicationId: string) => {
    setSelectedWorkers(prev => 
      prev.includes(applicationId) ? prev.filter(i => i !== applicationId) : [...prev, applicationId]
    );
  };

  const handleAssignWork = async () => {
    if (selectedWorkers.length === 0) {
      addToast('Please select at least one worker', 'error');
      return;
    }
    
    if (job.workersHired + selectedWorkers.length > job.workersNeeded) {
      addToast(`You only need ${job.workersNeeded - job.workersHired} more workers!`, 'error');
      return;
    }

    setIsHiring(true);
    for (const appId of selectedWorkers) {
      await hireWorker(job.id, appId);
    }
    setIsHiring(false);
    setSelectedWorkers([]);
    addToast('Workers successfully assigned!', 'success');
    setActiveTab('confirmed');
  };

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Assign Work" showBack onBack={() => navigate(-1)} />

      {/* Tabs */}
      <div className="px-5 pt-4">
        <div className="flex p-1 bg-slate-200/50 dark:bg-dark-800 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'pending'
                ? "bg-white dark:bg-dark-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Pending Worker
          </button>
          <button
            onClick={() => setActiveTab('confirmed')}
            className={clsx(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === 'confirmed'
                ? "bg-white dark:bg-dark-600 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            Confirmed Worker
          </button>
        </div>

        {/* Job Summary */}
        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-primary-900 dark:text-primary-100 font-extrabold text-sm">{job.title}</h3>
            <p className="text-primary-700/70 dark:text-primary-300/70 text-xs font-semibold mt-0.5">
              Hired: {job.workersHired} / {job.workersNeeded}
            </p>
          </div>
          <div className="w-10 h-10 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center font-black text-primary-600 shadow-sm text-sm">
            {Math.round((job.workersHired / job.workersNeeded) * 100)}%
          </div>
        </div>

        {/* Content */}
        {isLoading && <div className="text-center py-10 text-slate-500 font-bold">Loading workers...</div>}
        
        {!isLoading && activeTab === 'pending' && (
          <div className="flex flex-col gap-3">
            {pendingWorkers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold">No pending workers yet.</div>
            ) : (
              pendingWorkers.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => handleToggleSelection(app.id)}
                  className={clsx(
                    "bg-white dark:bg-dark-800 p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3",
                    selectedWorkers.includes(app.id) 
                      ? "border-primary-500 bg-primary-50/30 dark:bg-primary-900/10" 
                      : "border-slate-100 dark:border-dark-700 hover:border-slate-200"
                  )}
                >
                  <div className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors",
                    selectedWorkers.includes(app.id)
                      ? "bg-primary-500 border-primary-500 text-white"
                      : "border-slate-300 dark:border-dark-600 bg-transparent"
                  )}>
                    {selectedWorkers.includes(app.id) && <CheckCircle2 size={14} strokeWidth={4} />}
                  </div>
                  
                  {app.workerAvatar ? (
                    <img src={app.workerAvatar} alt={app.workerName} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-400">
                      <UserCircle2 size={24} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{app.workerName}</h4>
                    <p className="text-xs font-semibold text-slate-500">⭐ {app.workerRating.toFixed(1)} • ID: {app.workerId.slice(0, 6)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!isLoading && activeTab === 'confirmed' && (
          <div className="flex flex-col gap-3">
            {confirmedWorkers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-bold">No workers assigned yet.</div>
            ) : (
              confirmedWorkers.map((app) => (
                <div 
                  key={app.id}
                  onClick={() => navigate(`/pipeline/${job.id}/${app.workerId}`)}
                  className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-colors"
                >
                  {app.workerAvatar ? (
                    <img src={app.workerAvatar} alt={app.workerName} className="w-10 h-10 rounded-full object-cover border-2 border-green-500" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-400 border-2 border-green-500">
                      <UserCircle2 size={24} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{app.workerName}</h4>
                    <p className="text-xs font-semibold text-green-600">Confirmed</p>
                  </div>

                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {activeTab === 'pending' && pendingWorkers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
          <Button 
            fullWidth 
            size="lg" 
            onClick={handleAssignWork}
            loading={isHiring}
            disabled={selectedWorkers.length === 0}
          >
            Assign Work ({selectedWorkers.length})
          </Button>
        </div>
      )}
    </div>
  );
}
