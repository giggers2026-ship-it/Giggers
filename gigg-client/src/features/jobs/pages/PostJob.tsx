import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useWalletStore } from '../../../store/walletStore';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Calculator, Wallet, Shield, ShieldAlert } from 'lucide-react';
import { Modal } from '../../../components/ui';
import { JobFormSteps, type JobFormState, type JobFormSetters } from '../components/JobFormSteps';
import { parseDosAndDonts } from '../constants';

const STEP_TITLES: Record<number, string> = {
  1: 'Job Details',
  2: 'Time & Location',
  3: 'Requirements',
  4: 'Review & Confirm',
};

const REVIEW_FIELDS: { label: string; key: keyof JobFormState }[] = [
  { label: 'Title', key: 'title' },
  { label: 'Category', key: 'category' },
  { label: 'Nature of Work', key: 'natureOfWork' },
  { label: 'Client Name', key: 'clientName' },
  { label: 'Client ID', key: 'clientId' },
  { label: 'Workers Needed', key: 'workersNeeded' },
  { label: 'Pay per Worker', key: 'payPerWorker' },
  { label: 'Date', key: 'date' },
  { label: 'Reporting Time', key: 'reportingTime' },
  { label: 'End Time', key: 'endTime' },
  { label: 'Location', key: 'location' },
  { label: 'Address', key: 'address' },
  { label: 'Description', key: 'description' },
  { label: 'Mode of Payment', key: 'modeOfPayment' },
  { label: 'Payment Date', key: 'paymentDate' },
  { label: 'Dress Code', key: 'dressCode' },
  { label: 'Gender Preference', key: 'gender' },
];

export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { postJob, isLoading: isJobLoading } = useJobStore();
  const { wallet, fetchWallet } = useWalletStore();
  const { addToast } = useUIStore();
  const [step, setStep] = useState(1);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Redirect worker role
  useEffect(() => {
    if (user && user.role === 'worker') {
      navigate('/home');
      addToast('Workers cannot post jobs', 'error');
    }
  }, [user, navigate, addToast]);

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

  const totalCost = workersNeeded * (Number(payPerWorker) || 0);
  const platformFee = totalCost * 0.10;
  const totalPayable = totalCost + platformFee;

  const handleNext = () => {
    if (step === 1 && (!title || !category || !workersNeeded || !payPerWorker)) {
      addToast('Please fill essential details', 'error'); return;
    }
    if (step === 2 && (!date || !reportingTime || !location)) {
      addToast('Please fill time & location details', 'error'); return;
    }
    if (step === 3 && !description) {
      addToast('Please add a description', 'error'); return;
    }
    if (step < 4) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    // Escrow Check
    const currentBalance = wallet?.currentBalance || 0;
    if (currentBalance < totalPayable) {
      setShowWalletModal(true);
      return;
    }

    await executePostJob();
  };

  const executePostJob = async () => {
    if (!user) return;
    let newJobId: string;
    try {
      newJobId = await postJob({
        title, category, workersNeeded, payPerWorker: Number(payPerWorker),
        date, reportingTime, endTime, location, address, description,
        foodProvided: food, dressCode, genderPreference: gender as any,
        needLocationBasedWorkers, natureOfWork, clientName, clientId,
        modeOfPayment: modeOfPayment as any, paymentDate, dosAndDonts
      }, user.id);
    } catch (err: any) {
      addToast(err?.message || 'Failed to post job. Please try again.', 'error');
      return;
    }
    fetchWallet().catch(() => {});
    addToast('Job posted! Now set up the work pipeline.', 'success');
    navigate(`/pipeline-builder/${newJobId}`);
  };

  const handleAddFunds = () => {
    setShowWalletModal(false);
    navigate('/wallet');
    addToast('Add funds to your wallet to post this job', 'info');
  };

  const kycIncomplete = user && !user.isApproved && (user.kycStatus === 'not_started' || user.kycStatus === 'rejected');

  if (kycIncomplete) {
    return (
      <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
        <AppHeader title="Post a Job" showBack onBack={() => navigate(-1)} />
        <div className="px-5 pt-16 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <ShieldAlert size={36} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">KYC Required</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs">
            Complete your Aadhaar KYC verification before posting jobs.
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
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title={STEP_TITLES[step]} showBack onBack={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} />

      <div className="bg-white dark:bg-dark-800 px-5 pt-4 pb-6 shadow-sm mb-4">
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-primary-500' : 'bg-slate-100 dark:bg-dark-600'}`} />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Step {step} of 4</p>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">

            {step <= 3 && <JobFormSteps step={step as 1 | 2 | 3} state={formState} setters={formSetters} />}

            {step === 4 && (
              <>
                <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 border border-primary-100 dark:border-primary-900/30">
                  <div className="flex items-center gap-2 mb-2 text-primary-700 dark:text-primary-400 font-bold text-sm">
                    <Calculator size={16} /> Estimated Cost
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    <span>{workersNeeded} workers × ₹{payPerWorker || 0}</span>
                    <span>₹{totalCost}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    <span>Platform Fee (10%)</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="h-px bg-primary-200 dark:bg-primary-800/50 my-2" />
                  <div className="flex justify-between items-center font-black">
                    <span className="text-slate-900 dark:text-white">Total Payable</span>
                    <span className="text-lg text-primary-600 dark:text-primary-400">₹{totalPayable}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {REVIEW_FIELDS.map(({ label, key }) => {
                    const value = formState[key];
                    if (value === '' || value === undefined) return null;
                    return (
                      <div key={key} className="bg-slate-50 dark:bg-dark-700 p-3 rounded-xl flex justify-between items-center gap-3">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white text-right">{String(value)}</span>
                      </div>
                    );
                  })}
                  {(() => {
                    const { dos, donts } = parseDosAndDonts(formState.dosAndDonts);
                    return (
                      <>
                        {dos && (
                          <div className="bg-slate-50 dark:bg-dark-700 p-3 rounded-xl flex justify-between items-start gap-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">Do's</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white text-right whitespace-pre-wrap">{dos}</span>
                          </div>
                        )}
                        {donts && (
                          <div className="bg-slate-50 dark:bg-dark-700 p-3 rounded-xl flex justify-between items-start gap-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">Don'ts</span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white text-right whitespace-pre-wrap">{donts}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
        {!user?.isVerified && (
          <div className="mb-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 p-3 rounded-xl flex items-center gap-2">
            <Shield size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400">KYC Verification required to post jobs. Go to Profile to verify.</p>
          </div>
        )}
        <Button
          fullWidth
          size="lg"
          loading={isJobLoading}
          onClick={handleNext}
          disabled={!user?.isVerified}
        >
          {step < 4 ? 'Continue' : 'Confirm & Post Job'}
        </Button>
      </div>

      <Modal open={showWalletModal} onClose={() => setShowWalletModal(false)} title="Insufficient Funds">
        <div className="py-2 flex flex-col gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-800/30">
            <Wallet className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Escrow Required</p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                You need ₹{totalPayable} to post this job. Your current balance is ₹{wallet?.currentBalance || 0}.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-dark-800 p-4 rounded-xl border border-slate-100 dark:border-dark-600 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Amount to add</span>
            <span className="text-lg font-black text-primary-600">₹{totalPayable - (wallet?.currentBalance || 0)}</span>
          </div>
          <Button fullWidth size="lg" onClick={handleAddFunds}>
            Add Funds & Post Job
          </Button>
        </div>
      </Modal>
    </div>
  );
}
