import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { CheckCircle2, Circle, Camera, MapPin, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function WorkerPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobs, fetchJobs, applications, fetchAppliedJobs, updatePipelineStep } = useJobStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [steps, setSteps] = useState([
    { id: 'reporting', label: 'Report at Venue', completed: false, type: 'location' },
    { id: 'selfie', label: 'Take Selfie (Live Tracking)', completed: false, type: 'camera' },
    { id: 'tshirt', label: 'Check T-Shirt', completed: false, type: 'photo' },
    { id: 'shoes', label: 'Shoes Black', completed: false, type: 'photo' },
  ]);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);

  const job = jobs.find(j => j.id === jobId);
  const application = applications.find(a => a.jobId === jobId);

  useEffect(() => {
    if (!job) fetchJobs();
    if (user && !application) fetchAppliedJobs(user.id);
  }, [job, user, application, fetchJobs, fetchAppliedJobs]);

  useEffect(() => {
    if (application) {
      setSteps([
        { id: 'reporting', label: 'Report at Venue', completed: application.reportingCompleted || false, type: 'location' },
        { id: 'selfie', label: 'Take Selfie (Live Tracking)', completed: application.selfieCompleted || false, type: 'camera' },
        { id: 'tshirt', label: 'Check T-Shirt', completed: application.tshirtCompleted || false, type: 'photo' },
        { id: 'shoes', label: 'Shoes Black', completed: application.shoesCompleted || false, type: 'photo' },
      ]);
    }
  }, [application]);

  if (!job) {
    return <div className="p-5 text-center mt-20 font-bold dark:text-white">Loading job...</div>;
  }

  const handleAction = async (stepId: string) => {
    if (!application) return;
    setLoadingStep(stepId);
    try {
      await updatePipelineStep(application.id, stepId);
      setSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, completed: true } : s
      ));
      addToast('Task submitted to employer for verification', 'success');
    } catch (e) {
      addToast('Failed to submit task', 'error');
    } finally {
      setLoadingStep(null);
    }
  };

  const allCompleted = steps.every(s => s.completed);

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Active Job" showBack onBack={() => navigate(-1)} />

      {/* Hero map / header */}
      <div className="bg-slate-800 h-40 w-full relative">
        <div className="absolute inset-0 opacity-50 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=19.076,72.877&zoom=14&size=600x300&maptype=roadmap&style=feature:all|element:labels|visibility:off')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h2 className="text-xl font-extrabold shadow-sm">{job.title}</h2>
          <p className="text-xs font-semibold opacity-90 flex items-center gap-1 mt-1">
            <MapPin size={12} /> {job.location}
          </p>
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-700">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Your Pipeline Tasks</h3>
          
          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-dark-600 before:to-transparent">
            {steps.map((step, index) => {
              const isLocked = index > 0 && !steps[index - 1].completed;
              const isWorking = loadingStep === step.id;

              return (
                <div key={step.id} className={clsx(
                  "relative flex items-center justify-between group mb-6 last:mb-0 transition-opacity",
                  isLocked ? "opacity-50 grayscale pointer-events-none" : "opacity-100"
                )}>
                  <div className={clsx(
                    "flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 z-10 transition-colors",
                    step.completed 
                      ? "bg-green-500 border-green-200 dark:border-green-900/50 text-white" 
                      : "bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-600 text-slate-400"
                  )}>
                    {step.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  
                  <div className="w-[calc(100%-3.5rem)] p-4 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm ml-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={clsx(
                        "font-bold text-sm",
                        step.completed ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"
                      )}>
                        {step.label}
                      </span>
                      {step.type === 'camera' && <Camera size={16} className="text-slate-400" />}
                      {step.type === 'location' && <MapPin size={16} className="text-slate-400" />}
                      {step.type === 'photo' && <Upload size={16} className="text-slate-400" />}
                    </div>

                    {!step.completed && (
                      <Button 
                        size="sm" 
                        variant={step.type === 'camera' ? 'primary' : 'outline'}
                        className="w-full mt-2 py-1.5"
                        onClick={() => handleAction(step.id)}
                        loading={isWorking}
                      >
                        {step.type === 'location' ? 'Share Location' : 
                         step.type === 'camera' ? 'Open Camera' : 
                         'Upload Photo'}
                      </Button>
                    )}
                    
                    {step.completed && (
                      <div className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-dark-700 px-2 py-1 rounded inline-block mt-2">
                        Submitted & Verified
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {allCompleted && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">You're All Set!</h3>
            <p className="text-sm text-slate-500 mt-1">Enjoy your gig. Payment will be processed after completion.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
