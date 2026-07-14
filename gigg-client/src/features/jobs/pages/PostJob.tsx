import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button, Input, Select, Toggle, Textarea } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { useWalletStore } from '../../../store/walletStore';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Info, MapPin, Calculator, Wallet, Shield } from 'lucide-react';
import { Modal } from '../../../components/ui';

export default function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { postJob, isLoading: isJobLoading } = useJobStore();
  const { wallet } = useWalletStore();
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

  // Category-specific hints
  const categoryHint = category === 'Catering'
    ? 'e.g. Wedding servers, buffet waitstaff, banquet crew'
    : category === 'Pamphlet Dist.'
    ? 'e.g. Flyer team, area distributors, ground deployment'
    : '';

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    // Auto-set sensible dress code defaults
    if (val === 'Catering') setDressCode('Formal (White shirt, Black trousers)');
    if (val === 'Pamphlet Dist.') setDressCode('Casual');
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
    if (step < 3) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!description) { addToast('Please add a description', 'error'); return; }
    
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
    await postJob({
      title, category, workersNeeded, payPerWorker: Number(payPerWorker),
      date, reportingTime, endTime, location, address, description,
      foodProvided: food, dressCode, genderPreference: gender as any,
    }, user.id);
    addToast('Job posted & funds held in escrow! 🎉', 'success');
    navigate('/jobs?tab=postings');
  };

  const handleAddFunds = () => {
    setShowWalletModal(false);
    addToast(`Please top up your wallet with at least ₹${totalPayable - (wallet?.currentBalance || 0)} to post this job.`, 'info');
    navigate('/wallet');
  };

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title={step === 1 ? 'Job Details' : step === 2 ? 'Time & Location' : 'Requirements'} showBack onBack={() => step > 1 ? setStep(s => s - 1) : navigate(-1)} />

      <div className="bg-white dark:bg-dark-800 px-5 pt-4 pb-6 shadow-sm mb-4">
        <div className="flex gap-1.5 mb-2">
          {[1,2,3].map(i => (
            <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-primary-500' : 'bg-slate-100 dark:bg-dark-600'}`} />
          ))}
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Step {step} of 3</p>
      </div>

      <div className="px-5">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
            
            {step === 1 && (
              <>
                <Input label="Job Title *" placeholder={category ? categoryHint : 'e.g. Wedding Catering Staff'} value={title} onChange={e => setTitle(e.target.value)} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Catering', 'Pamphlet Dist.'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryChange(cat)}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          category === cat
                            ? cat === 'Catering'
                              ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-900/20 dark:border-amber-500 dark:text-amber-300'
                              : 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-dark-500 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg">{cat === 'Catering' ? '👨‍🍳' : '📄'}</span>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {categoryHint && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-1">{categoryHint}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Workers Needed *" type="number" min="1" value={workersNeeded} onChange={e => setWorkersNeeded(Number(e.target.value))} />
                  <Input label="Pay per Worker (₹) *" type="number" placeholder="500" value={payPerWorker} onChange={e => setPayPerWorker(e.target.value)} />
                </div>
                
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
              </>
            )}

            {step === 2 && (
              <>
                <Input label="Date *" type="date" value={date} onChange={e => setDate(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Reporting Time *" type="time" value={reportingTime} onChange={e => setReportingTime(e.target.value)} />
                  <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
                <Input label="City/Area *" placeholder="e.g. Bandra West, Mumbai" value={location} onChange={e => setLocation(e.target.value)} leftIcon={<MapPin size={16} />} />
                <Textarea label="Complete Address" placeholder="Full venue address" rows={3} value={address} onChange={e => setAddress(e.target.value)} />
              </>
            )}

            {step === 3 && (
              <>
                <Textarea label="Job Description *" placeholder="Detail what the workers need to do..." rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                <Select label="Dress Code" value={dressCode} onChange={e => setDressCode(e.target.value)} options={[
                  { value: 'Casual', label: 'Casual' },
                  { value: 'Formal (Black & White)', label: 'Formal (Black & White)' },
                  { value: 'Uniform Provided', label: 'Uniform Provided at venue' },
                ]} />
                <Select label="Gender Preference" value={gender} onChange={e => setGender(e.target.value)} options={[
                  { value: 'any', label: 'Any' },
                  { value: 'male', label: 'Male Only' },
                  { value: 'female', label: 'Female Only' },
                ]} />
                <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-slate-100 dark:border-dark-600">
                  <Toggle checked={food} onChange={setFood} label="Food provided at venue" />
                </div>
                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                  <Info size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Payment will be held in escrow and released to workers only after successful completion verified via OTP.</p>
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
          {step < 3 ? 'Continue' : 'Post Job'}
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
