import React from 'react';
import { Input, Select, Toggle, Textarea } from '../../../components/ui';
import { Info, MapPin, Calculator } from 'lucide-react';

export interface JobFormState {
  title: string;
  category: string;
  workersNeeded: number;
  payPerWorker: string;
  date: string;
  reportingTime: string;
  endTime: string;
  location: string;
  address: string;
  description: string;
  food: boolean;
  dressCode: string;
  gender: string;
  natureOfWork: string;
  clientName: string;
  clientId: string;
  needLocationBasedWorkers: boolean;
  modeOfPayment: string;
  paymentDate: string;
  dosAndDonts: string;
}

export interface JobFormSetters {
  setTitle: (v: string) => void;
  setCategory: (v: string) => void;
  setWorkersNeeded: (v: number) => void;
  setPayPerWorker: (v: string) => void;
  setDate: (v: string) => void;
  setReportingTime: (v: string) => void;
  setEndTime: (v: string) => void;
  setLocation: (v: string) => void;
  setAddress: (v: string) => void;
  setDescription: (v: string) => void;
  setFood: (v: boolean) => void;
  setDressCode: (v: string) => void;
  setGender: (v: string) => void;
  setNatureOfWork: (v: string) => void;
  setClientName: (v: string) => void;
  setClientId: (v: string) => void;
  setNeedLocationBasedWorkers: (v: boolean) => void;
  setModeOfPayment: (v: string) => void;
  setPaymentDate: (v: string) => void;
  setDosAndDonts: (v: string) => void;
}

interface JobFormStepsProps {
  step: 1 | 2 | 3;
  state: JobFormState;
  setters: JobFormSetters;
}

export function JobFormSteps({ step, state, setters }: JobFormStepsProps) {
  const categoryHint = state.category === 'Catering'
    ? 'e.g. Wedding servers, buffet waitstaff, banquet crew'
    : state.category === 'Pamphlet Dist.'
    ? 'e.g. Flyer team, area distributors, ground deployment'
    : '';

  const handleCategoryChange = (val: string) => {
    setters.setCategory(val);
    if (val === 'Catering') setters.setDressCode('Formal (White shirt, Black trousers)');
    if (val === 'Pamphlet Dist.') setters.setDressCode('Casual');
  };

  const totalCost = state.workersNeeded * (Number(state.payPerWorker) || 0);
  const platformFee = totalCost * 0.10;
  const totalPayable = totalCost + platformFee;

  if (step === 1) {
    return (
      <>
        <Input label="Job Title *" placeholder={state.category ? categoryHint : 'e.g. Wedding Catering Staff'} value={state.title} onChange={e => setters.setTitle(e.target.value)} />
        <Input label="Nature of work *" placeholder="e.g. Serving food to guests" value={state.natureOfWork} onChange={e => setters.setNatureOfWork(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Client Name" placeholder="e.g. Rajesh Kumar" value={state.clientName} onChange={e => setters.setClientName(e.target.value)} />
          <Input label="Client ID" placeholder="e.g. CLI-9021" value={state.clientId} onChange={e => setters.setClientId(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {['Catering', 'Pamphlet Dist.'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                  state.category === cat
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
          <Input label="Workers Needed *" type="number" min="1" value={state.workersNeeded} onChange={e => setters.setWorkersNeeded(Number(e.target.value))} />
          <Input label="Pay per Worker (₹) *" type="number" placeholder="500" value={state.payPerWorker} onChange={e => setters.setPayPerWorker(e.target.value)} />
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-4 border border-primary-100 dark:border-primary-900/30">
          <div className="flex items-center gap-2 mb-2 text-primary-700 dark:text-primary-400 font-bold text-sm">
            <Calculator size={16} /> Estimated Cost
          </div>
          <div className="flex justify-between items-center text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            <span>{state.workersNeeded} workers × ₹{state.payPerWorker || 0}</span>
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
    );
  }

  if (step === 2) {
    return (
      <>
        <Input label="Date *" type="date" value={state.date} onChange={e => setters.setDate(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Reporting Time *" type="time" value={state.reportingTime} onChange={e => setters.setReportingTime(e.target.value)} />
          <Input label="End Time" type="time" value={state.endTime} onChange={e => setters.setEndTime(e.target.value)} />
        </div>
        <Input label="City/Area *" placeholder="e.g. Bandra West, Mumbai" value={state.location} onChange={e => setters.setLocation(e.target.value)} leftIcon={<MapPin size={16} />} />
        <Textarea label="Complete Address" placeholder="Full venue address" rows={3} value={state.address} onChange={e => setters.setAddress(e.target.value)} />
        <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-slate-100 dark:border-dark-600 mt-2">
          <Toggle checked={state.needLocationBasedWorkers} onChange={setters.setNeedLocationBasedWorkers} label="Need Location based workers?" />
        </div>
      </>
    );
  }

  return (
    <>
      <Textarea label="Job Description *" placeholder="Detail what the workers need to do..." rows={5} value={state.description} onChange={e => setters.setDescription(e.target.value)} />
      <Textarea label="Do's & Don'ts" placeholder="e.g. Do arrive 15 mins early. Don't use phones during service." rows={3} value={state.dosAndDonts} onChange={e => setters.setDosAndDonts(e.target.value)} />
      <Select label="Mode of Payment" value={state.modeOfPayment} onChange={e => setters.setModeOfPayment(e.target.value)} options={[
        { value: 'Online', label: 'Online' },
        { value: 'Cash', label: 'Cash' },
        { value: 'Wallet', label: 'Wallet' },
      ]} />
      <Input label="Payment Date" type="date" value={state.paymentDate} onChange={e => setters.setPaymentDate(e.target.value)} />
      <Select label="Dress Code" value={state.dressCode} onChange={e => setters.setDressCode(e.target.value)} options={[
        { value: 'Casual', label: 'Casual' },
        { value: 'Formal (Black & White)', label: 'Formal (Black & White)' },
        { value: 'Uniform Provided', label: 'Uniform Provided at venue' },
      ]} />
      <Select label="Gender Preference" value={state.gender} onChange={e => setters.setGender(e.target.value)} options={[
        { value: 'any', label: 'Any' },
        { value: 'male', label: 'Male Only' },
        { value: 'female', label: 'Female Only' },
      ]} />
      <div className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-slate-100 dark:border-dark-600">
        <Toggle checked={state.food} onChange={setters.setFood} label="Food provided at venue" />
      </div>
      <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
        <Info size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Payment will be held in escrow and released to workers only after successful completion verified via OTP.</p>
      </div>
    </>
  );
}
