import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { JobFormSteps, type JobFormState, type JobFormSetters } from '../components/JobFormSteps';

const STEP_TITLES: Record<number, string> = {
  1: 'Job Details',
  2: 'Time & Location',
  3: 'Requirements',
};

export default function JobEdit() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuthStore();
  const { myJobs, fetchPostedJobs, updateJob } = useJobStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const job = myJobs.find(j => j.id === jobId);

  useEffect(() => {
    if (!job && user) fetchPostedJobs(user.id);
  }, [job, user, fetchPostedJobs]);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [workersNeeded, setWorkersNeeded] = useState(1);
  const [payPerWorker, setPayPerWorker] = useState('');
  const [date, setDate] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [food, setFood] = useState(false);
  const [dressCode, setDressCode] = useState('Casual');
  const [gender, setGender] = useState('any');
  const [natureOfWork, setNatureOfWork] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [needLocationBasedWorkers, setNeedLocationBasedWorkers] = useState(false);
  const [modeOfPayment, setModeOfPayment] = useState('Online');
  const [paymentDate, setPaymentDate] = useState('');
  const [dosAndDonts, setDosAndDonts] = useState('');

  // Pre-fill once the job loads
  useEffect(() => {
    if (job && !loaded) {
      setTitle(job.title);
      setCategory(job.category);
      setWorkersNeeded(job.workersNeeded);
      setPayPerWorker(String(job.payPerWorker));
      setDate(job.date);
      setReportingTime(job.reportingTime);
      setEndTime(job.endTime);
      setLocation(job.location);
      setAddress(job.address);
      setDescription(job.description);
      setFood(job.foodProvided);
      setDressCode(job.dressCode);
      setGender(job.genderPreference);
      setNatureOfWork(job.natureOfWork);
      setClientName(job.clientName);
      setClientId(job.clientId);
      setNeedLocationBasedWorkers(job.needLocationBasedWorkers);
      setModeOfPayment(job.modeOfPayment);
      setPaymentDate(job.paymentDate);
      setDosAndDonts(job.dosAndDonts);
      setLoaded(true);
    }
  }, [job, loaded]);

  const formState: JobFormState = {
    title, category, workersNeeded, payPerWorker, date, reportingTime, endTime,
    location, address, description, food, dressCode, gender, natureOfWork,
    clientName, clientId, needLocationBasedWorkers, modeOfPayment, paymentDate, dosAndDonts,
  };
  const formSetters: JobFormSetters = {
    setTitle, setCategory, setWorkersNeeded, setPayPerWorker, setDate, setReportingTime, setEndTime,
    setLocation, setAddress, setDescription, setFood, setDressCode, setGender, setNatureOfWork,
    setClientName, setClientId, setNeedLocationBasedWorkers, setModeOfPayment, setPaymentDate, setDosAndDonts,
  };

  const handleNext = async () => {
    if (step === 1 && (!title || !category || !workersNeeded || !payPerWorker)) {
      addToast('Please fill essential details', 'error'); return;
    }
    if (step === 2 && (!date || !reportingTime || !location)) {
      addToast('Please fill time & location details', 'error'); return;
    }
    if (step < 3) { setStep(s => s + 1); return; }

    if (!description) { addToast('Please add a description', 'error'); return; }
    if (!jobId || !user) return;

    setSaving(true);
    try {
      const { creditPenaltyApplied } = await updateJob(jobId, {
        title, category, workersNeeded, payPerWorker: Number(payPerWorker),
        date, reportingTime, endTime, location, address, description,
        foodProvided: food, dressCode, genderPreference: gender as any,
        needLocationBasedWorkers, natureOfWork, clientName, clientId,
        modeOfPayment: modeOfPayment as any, paymentDate, dosAndDonts,
      }, user.id);

      if (creditPenaltyApplied) {
        addToast('Job updated. 5 credit points deducted for editing within 1 hour of start.', 'warning');
      } else {
        addToast('Job updated successfully!', 'success');
      }
      navigate(`/jobs/${jobId}`);
    } catch (err: any) {
      addToast(err?.message || 'Failed to update job', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!job) {
    return <div className="p-5 text-center mt-20 font-bold dark:text-white">Loading job...</div>;
  }

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title={STEP_TITLES[step]} showBack onBack={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} />

      <div className="bg-white dark:bg-dark-800 px-5 pt-4 pb-6 shadow-sm mb-4">
        <div className="flex gap-1.5 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-primary-500' : 'bg-slate-100 dark:bg-dark-600'}`} />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Step {step} of 3</p>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
            <JobFormSteps step={step as 1 | 2 | 3} state={formState} setters={formSetters} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
        <Button fullWidth size="lg" loading={saving} onClick={handleNext}>
          {step < 3 ? 'Continue' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
