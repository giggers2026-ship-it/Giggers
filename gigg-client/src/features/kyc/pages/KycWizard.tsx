import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  Upload,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useUIStore } from '../../../store/uiStore';
import { api } from '../../../lib/api';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Convert a File to a base64 data-URL string */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

interface DocCaptureProps {
  label: string;
  hint: string;
  value: string | null;
  onChange: (v: string) => void;
  aspect?: 'card' | 'square';
}

/** Camera-or-upload tile used for document images */
function DocCapture({ label, hint, value, onChange, aspect = 'card' }: DocCaptureProps) {
  const [camOpen, setCamOpen] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOpen(false);
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  const openCam = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamErr('Camera not supported in this browser.');
      return;
    }
    setCamErr(null);
    setCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCamErr('Unable to access camera. Please allow camera permission.');
      setCamOpen(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { setCamErr('Camera not ready yet.'); return; }
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const img = canvas.toDataURL('image/jpeg', 0.88);
    onChange(img);
    stopCam();
    setBusy(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const b64 = await fileToBase64(file);
      onChange(b64);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const boxClass =
    aspect === 'card'
      ? 'w-full aspect-[1.6/1]'
      : 'w-full aspect-square max-w-[220px] mx-auto rounded-full';

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      </div>

      {/* Preview / camera */}
      <div
        className={`${boxClass} bg-slate-50 dark:bg-dark-700 border-2 border-dashed border-slate-200 dark:border-dark-500 rounded-2xl flex items-center justify-center overflow-hidden relative`}
      >
        {camOpen ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={aspect === 'square' ? { transform: 'scaleX(-1)' } : undefined}
          />
        ) : value ? (
          <>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
              style={aspect === 'square' ? { borderRadius: '50%' } : undefined}
            />
            <button
              onClick={() => onChange('')}
              className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            {aspect === 'square' ? <Camera size={32} /> : <Upload size={28} />}
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1">
              {aspect === 'square' ? 'Tap Camera to Capture' : 'No image yet'}
            </p>
          </div>
        )}
      </div>

      {camErr && <p className="text-xs font-bold text-red-500 text-center">{camErr}</p>}

      {/* Camera controls */}
      {camOpen ? (
        <div className="flex gap-2">
          <button
            onClick={stopCam}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-dark-500 text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={capture}
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60"
          >
            <Camera size={15} /> Capture
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={openCam}
            disabled={busy}
            className="flex-1 py-3 rounded-xl border-2 border-primary-200 dark:border-primary-800/50 text-primary-600 dark:text-primary-400 text-sm font-bold flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/10 active:scale-95 transition-transform disabled:opacity-60"
          >
            <Camera size={15} /> {value ? 'Retake' : 'Camera'}
          </button>
          <label className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-dark-500 text-slate-600 dark:text-slate-400 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer bg-slate-50 dark:bg-dark-700 active:scale-95 transition-transform">
            <Upload size={15} /> Upload
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              disabled={busy}
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Selfie capture (front camera, always camera-only)
// ─────────────────────────────────────────────────────────────

interface SelfieCaptureProps {
  value: string | null;
  onChange: (v: string) => void;
}

function SelfieCapture({ value, onChange }: SelfieCaptureProps) {
  const [camOpen, setCamOpen] = useState(false);
  const [camErr, setCamErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCam = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOpen(false);
  }, []);

  useEffect(() => () => stopCam(), [stopCam]);

  const openCam = async () => {
    setCamErr(null);
    setCamOpen(true);
    onChange('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch {
      setCamErr('Camera permission denied. Please allow access and try again.');
      setCamOpen(false);
    }
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { setCamErr('Camera still loading, please wait.'); return; }
    setBusy(true);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const img = canvas.toDataURL('image/jpeg', 0.92);
    onChange(img);
    stopCam();
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Circle preview */}
      <div className="w-52 h-52 rounded-full overflow-hidden border-4 border-primary-200 dark:border-primary-800/50 bg-slate-100 dark:bg-dark-700 flex items-center justify-center relative">
        {camOpen ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : value ? (
          <>
            <img src={value} alt="Selfie" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange('')}
              className="absolute top-3 right-3 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Camera size={40} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Take Selfie</p>
          </div>
        )}
      </div>

      {camErr && <p className="text-xs font-bold text-red-500 text-center">{camErr}</p>}

      {camOpen ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={stopCam}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-dark-500 text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"
          >
            <X size={15} /> Cancel
          </button>
          <button
            onClick={capture}
            disabled={busy}
            className="flex-1 py-3.5 rounded-2xl bg-primary-600 text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60 shadow-lg shadow-primary-500/25"
          >
            <Camera size={15} /> Capture
          </button>
        </div>
      ) : (
        <button
          onClick={openCam}
          disabled={busy}
          className="w-full py-3.5 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary-500/25"
        >
          <Camera size={18} /> {value ? 'Retake Selfie' : 'Open Camera'}
        </button>
      )}

      <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
        Make sure your face is clearly visible and well-lit. This will be used to verify your identity.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main KYC Wizard
// ─────────────────────────────────────────────────────────────

const SLIDE_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

export default function KycWizard() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuthStore();
  const { addToast } = useUIStore();

  // Step 1 — Personal Info
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [area, setArea] = useState(user?.area || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');

  // Step 2 — Aadhaar
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.aadhaarNumber?.replace(/\s/g, '') || '');
  const [aadhaarFront, setAadhaarFront] = useState<string>(user?.aadhaarFront || '');
  const [aadhaarBack, setAadhaarBack] = useState<string>(user?.aadhaarBack || '');

  // Step 3 — PAN
  const [panNumber, setPanNumber] = useState(user?.panNumber || '');
  const [panFront, setPanFront] = useState<string>(user?.panFront || '');
  const [panBack, setPanBack] = useState<string>(user?.panBack || '');

  // Step 4 — Selfie
  const [selfie, setSelfie] = useState<string>(user?.selfie || '');

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 4;

  // If already approved — go home
  useEffect(() => {
    if (user?.isApproved) navigate('/home', { replace: true });
  }, [user?.isApproved, navigate]);

  // If already submitted — go to pending
  useEffect(() => {
    if (user?.kycStatus === 'submitted') navigate('/pending', { replace: true });
  }, [user?.kycStatus, navigate]);

  const goTo = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!name.trim()) { addToast('Please enter your full name', 'error'); return false; }
      if (!city.trim()) { addToast('Please enter your city', 'error'); return false; }
      if (!area.trim()) { addToast('Please enter your area / locality', 'error'); return false; }
      if (user?.role === 'employer' && !companyName.trim()) {
        addToast('Please enter your company name', 'error'); return false;
      }
    }
    if (step === 2) {
      if (aadhaarNumber.replace(/\D/g, '').length !== 12) {
        addToast('Aadhaar number must be 12 digits', 'error'); return false;
      }
      if (!aadhaarFront) { addToast('Please upload or capture Aadhaar front', 'error'); return false; }
      if (!aadhaarBack) { addToast('Please upload or capture Aadhaar back', 'error'); return false; }
    }
    if (step === 3) {
      if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/.test(panNumber)) {
        addToast('Enter a valid 10-character PAN number (e.g. ABCDE1234F)', 'error'); return false;
      }
      if (!panFront) { addToast('Please upload or capture PAN front', 'error'); return false; }
      if (!panBack) { addToast('Please upload or capture PAN back', 'error'); return false; }
    }
    if (step === 4) {
      if (!selfie) { addToast('Please take a selfie to continue', 'error'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) {
      goTo(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await api.post('/api/kyc/submit', {
        name: name.trim(),
        city: city.trim(),
        area: area.trim(),
        companyName: user?.role === 'employer' ? companyName.trim() : undefined,
        aadhaarNumber: aadhaarNumber.replace(/\D/g, ''),
        aadhaarFront,
        aadhaarBack,
        panNumber: panNumber.toUpperCase().trim(),
        panFront,
        panBack,
        selfie,
      });

      await refreshUser();
      setSubmitted(true);
      addToast('KYC submitted! Waiting for admin approval.', 'success');
      setTimeout(() => navigate('/pending', { replace: true }), 1800);
    } catch (err: any) {
      addToast(err?.message || 'Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submitted success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-900 px-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={44} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">KYC Submitted!</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Redirecting…</p>
        </motion.div>
      </div>
    );
  }

  // ── Step labels ──
  const stepLabels = ['Personal Info', 'Aadhaar', 'PAN Card', 'Selfie'];
  const stepIcons = [UserIcon, Shield, Shield, Camera];
  const StepIcon = stepIcons[step - 1];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 via-indigo-600 to-violet-700 px-5 pt-12 pb-24 relative overflow-hidden flex-shrink-0">
        <div className="absolute -top-8 -right-8 w-44 h-44 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

        {step > 1 && (
          <button
            onClick={() => goTo(step - 1)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-4 relative z-10"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
        )}
        {step === 1 && <div className="h-9 mb-4" />}

        <div className="relative z-10 mb-2">
          <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest">
            Step {step} of {totalSteps} — {stepLabels[step - 1]}
          </p>
          <div className="flex gap-1.5 mt-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-400 ${
                  i < step ? 'bg-white' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
            <StepIcon size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">{stepLabels[step - 1]}</h1>
            <p className="text-white/65 text-sm font-medium">
              {step === 1 && 'Confirm your basic details'}
              {step === 2 && 'Upload front & back of your Aadhaar'}
              {step === 3 && 'Upload front & back of your PAN card'}
              {step === 4 && 'Take a live selfie for identity match'}
            </p>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 bg-white dark:bg-dark-900 rounded-t-3xl -mt-8 z-10 relative">
        <div className="h-full overflow-y-auto no-scrollbar px-5 pt-7 pb-32">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col gap-5"
            >
              {/* ── STEP 1: Personal Info ── */}
              {step === 1 && (
                <>
                  <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30 rounded-2xl p-4">
                    <p className="text-xs font-bold text-primary-800 dark:text-primary-300 flex items-center gap-2">
                      <Shield size={13} /> KYC Verification Required
                    </p>
                    <p className="text-[11px] text-primary-600 dark:text-primary-400 mt-1 leading-relaxed">
                      Complete this once to unlock{' '}
                      {user?.role === 'employer' ? 'job posting' : 'job applications'} after admin
                      approval.
                    </p>
                  </div>

                  {[
                    {
                      label: 'Full Name *',
                      value: name,
                      onChange: setName,
                      placeholder: 'As on your Aadhaar card',
                      icon: <UserIcon size={16} />,
                    },
                    {
                      label: 'City *',
                      value: city,
                      onChange: setCity,
                      placeholder: 'e.g. Mumbai',
                      icon: <MapPin size={16} />,
                    },
                    {
                      label: 'Area / Locality *',
                      value: area,
                      onChange: setArea,
                      placeholder: 'e.g. Andheri West',
                      icon: <MapPin size={16} />,
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                        {f.label}
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-2xl px-4 py-3.5">
                        <span className="text-slate-400">{f.icon}</span>
                        <input
                          value={f.value}
                          onChange={(e) => f.onChange(e.target.value)}
                          placeholder={f.placeholder}
                          className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  ))}

                  {user?.role === 'employer' && (
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                        Company / Business Name *
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-2xl px-4 py-3.5">
                        <input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Your company name"
                          className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── STEP 2: Aadhaar ── */}
              {step === 2 && (
                <>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-2xl p-4">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      📋 Aadhaar Card — Front & Back
                    </p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      Upload a clear photo of both sides. The 12-digit number must be readable.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                      Aadhaar Number *
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-2xl px-4 py-3.5">
                      <input
                        value={aadhaarNumber}
                        onChange={(e) =>
                          setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))
                        }
                        placeholder="0000 0000 0000"
                        inputMode="numeric"
                        maxLength={12}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 tracking-widest"
                      />
                      {aadhaarNumber.length === 12 && (
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <DocCapture
                    label="Aadhaar Front *"
                    hint="Front side showing your name, DOB and photo"
                    value={aadhaarFront}
                    onChange={setAadhaarFront}
                    aspect="card"
                  />
                  <DocCapture
                    label="Aadhaar Back *"
                    hint="Back side showing your address"
                    value={aadhaarBack}
                    onChange={setAadhaarBack}
                    aspect="card"
                  />
                </>
              )}

              {/* ── STEP 3: PAN ── */}
              {step === 3 && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
                    <p className="text-xs font-bold text-blue-800 dark:text-blue-300">
                      🪪 PAN Card — Front & Back
                    </p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                      Upload both sides of your PAN card. The 10-character PAN must be readable.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                      PAN Number *
                    </label>
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 rounded-2xl px-4 py-3.5">
                      <input
                        value={panNumber}
                        onChange={(e) =>
                          setPanNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
                        }
                        placeholder="ABCDE1234F"
                        maxLength={10}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-slate-400 tracking-widest"
                      />
                      {/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(panNumber) && (
                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <DocCapture
                    label="PAN Front *"
                    hint="Front side showing your name, DOB and PAN number"
                    value={panFront}
                    onChange={setPanFront}
                    aspect="card"
                  />
                  <DocCapture
                    label="PAN Back *"
                    hint="Back side of your PAN card"
                    value={panBack}
                    onChange={setPanBack}
                    aspect="card"
                  />
                </>
              )}

              {/* ── STEP 4: Selfie ── */}
              {step === 4 && (
                <>
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl p-4">
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      🤳 Live Selfie
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                      Face the front camera in good lighting. No glasses or face coverings.
                    </p>
                  </div>

                  <SelfieCapture value={selfie} onChange={setSelfie} />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-5 pb-8 pt-4 bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-dark-700 z-20">
          <button
            onClick={handleNext}
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : step < totalSteps ? (
              <>
                Continue <ArrowRight size={18} />
              </>
            ) : (
              <>
                <Clock size={18} /> Submit for Approval
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
            Your documents are encrypted and only reviewed by our admin team
          </p>
        </div>
      </div>
    </div>
  );
}
