import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useUIStore } from '../../../store/uiStore';
import { CheckCircle2, Circle, Camera, UserSquare2, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function PipelineManager() {
  const { jobId, workerId } = useParams();
  const navigate = useNavigate();
  const { myJobs, jobCandidates, fetchJobCandidates, updatePipelineStep } = useJobStore();
  const { addToast } = useUIStore();

  const [steps, setSteps] = useState([
    { id: 'reporting', label: 'Reporting (9:00 AM)', completed: false, type: 'time' },
    { id: 'selfie', label: 'Taking Selfie (Live Tracking)', completed: false, type: 'camera' },
    { id: 'tshirt', label: 'Check T-Shirt', completed: false, type: 'check' },
    { id: 'shoes', label: 'Shoes Black', completed: false, type: 'check' },
  ]);

  const job = myJobs.find(j => j.id === jobId);
  const application = jobCandidates.find(c => c.workerId === workerId && c.jobId === jobId);

  useEffect(() => {
    if (jobId && jobCandidates.length === 0) {
      fetchJobCandidates(jobId);
    }
  }, [jobId, jobCandidates.length, fetchJobCandidates]);

  useEffect(() => {
    if (application) {
      setSteps([
        { id: 'reporting', label: 'Reporting (9:00 AM)', completed: application.reportingCompleted || false, type: 'time' },
        { id: 'selfie', label: 'Taking Selfie (Live Tracking)', completed: application.selfieCompleted || false, type: 'camera' },
        { id: 'tshirt', label: 'Check T-Shirt', completed: application.tshirtCompleted || false, type: 'check' },
        { id: 'shoes', label: 'Shoes Black', completed: application.shoesCompleted || false, type: 'check' },
      ]);
    }
  }, [application]);

  if (!job || !application) {
    return <div className="p-5 text-center mt-20 font-bold dark:text-white">Loading pipeline...</div>;
  }

  const handleToggleStep = async (stepId: string) => {
    // If it's already completed in the DB, toggling it off might not be supported by updatePipelineStep (it sets to true).
    // For now, if the employer clicks it, we just mark it true in DB if it's false.
    try {
      await updatePipelineStep(application.id, stepId);
      addToast('Step verified successfully', 'success');
    } catch (e) {
      addToast('Failed to update step', 'error');
    }
  };

  const allCompleted = steps.every(s => s.completed);

  const handleMarkPresent = () => {
    if (!allCompleted) {
      addToast('Please complete all checks first', 'warning');
      return;
    }
    addToast('Worker marked as Present!', 'success');
    navigate(-1);
  };

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Pipeline" showBack onBack={() => navigate(-1)} />

      <div className="px-5 pt-6">
        {/* Worker Profile Header */}
        <div className="flex items-center gap-4 mb-6 bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-700">
          {application.workerAvatar ? (
            <img src={application.workerAvatar} alt={application.workerName} className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 p-0.5" />
          ) : (
            <div className="w-16 h-16 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-400 border-2 border-primary-500 p-0.5">
              <UserSquare2 size={32} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{application.workerName}</h2>
            <p className="text-sm font-semibold text-slate-500">ID: {application.workerId.slice(0, 6)}</p>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-700">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Verification Steps</h3>
          
          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-dark-600 before:to-transparent">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                <div 
                  onClick={() => handleToggleStep(step.id)}
                  className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 cursor-pointer z-10 transition-colors",
                    step.completed 
                      ? "bg-green-500 border-green-200 dark:border-green-900/50 text-white" 
                      : "bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-600 text-slate-400"
                  )}
                >
                  {step.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm ml-4 cursor-pointer hover:border-primary-300 transition-colors" onClick={() => handleToggleStep(step.id)}>
                  <div className="flex items-center gap-3">
                    {step.type === 'camera' && <Camera size={18} className="text-primary-500" />}
                    <span className={clsx(
                      "font-bold text-sm",
                      step.completed ? "text-slate-900 dark:text-white" : "text-slate-500"
                    )}>
                      {step.label}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
        <Button 
          fullWidth 
          size="lg" 
          onClick={handleMarkPresent}
          disabled={!allCompleted}
        >
          {allCompleted ? 'Mark as Present' : 'Complete all steps'}
        </Button>
      </div>
    </div>
  );
}
