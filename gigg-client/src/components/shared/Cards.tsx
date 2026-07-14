import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { Job, UserProfile } from '../../types/index';
import { Badge, Avatar, Rating } from '../ui';
import { MapPin, Clock, Users, Utensils, Shield, Star, Bookmark } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ============================================================
// JOB CARD
// ============================================================
interface JobCardProps {
  job: Job;
  onClick?: () => void;
  onSave?: () => void;
  saved?: boolean;
  variant?: 'list' | 'grid' | 'featured';
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, onSave, saved, variant = 'list' }) => {
  const { user } = useAuthStore();
  const isWorker = user?.role === 'worker';
  const accentColor = isWorker ? 'text-green-600' : 'text-blue-600';
  const accentBg = isWorker ? 'bg-green-50' : 'bg-blue-50';

  const statusColor = {
    active:    { variant: 'success' as const, label: 'Hiring' },
    draft:     { variant: 'gray'    as const, label: 'Draft' },
    completed: { variant: 'primary' as const, label: 'Done' },
    cancelled: { variant: 'danger'  as const, label: 'Cancelled' },
  }[job.status];

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex-shrink-0 w-72 rounded-3xl overflow-hidden cursor-pointer shadow-card-md animate-fade-up"
        style={{ background: isWorker ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
      >
        <div className="p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-3xl">{job.categoryEmoji}</span>
            {job.isUrgent && <span className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full">URGENT</span>}
          </div>
          <h3 className="font-extrabold text-base mb-1 leading-tight">{job.title}</h3>
          <p className="text-white/70 text-xs font-semibold mb-3">{job.employerName}</p>
          <div className="flex items-center gap-3 text-white/80 text-xs font-semibold mb-4">
            <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {job.reportingTime}</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-bold">PAY</p>
              <p className="text-xl font-black">₹{job.payPerWorker}</p>
            </div>
            <div className="bg-white text-slate-900 text-xs font-extrabold px-3 py-1.5 rounded-full">Apply Now →</div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'grid') {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="card p-4 cursor-pointer flex flex-col gap-2 hover:shadow-card-md transition-shadow duration-200"
      >
        <div className="flex justify-between items-start mb-1">
          <span className="text-2xl">{job.categoryEmoji}</span>
          <Badge variant={statusColor.variant}>{statusColor.label}</Badge>
        </div>
        <h3 className="font-extrabold text-sm text-slate-900 mb-1 leading-tight line-clamp-2">{job.title}</h3>
        <p className="text-xs text-slate-500 font-semibold mb-1">{job.employerName}</p>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mb-2">
          <MapPin size={11} /> {job.location}
        </p>
        <p className={clsx("text-lg font-black mt-auto", accentColor)}>₹{job.payPerWorker}</p>
      </motion.div>
    );
  }

  // List variant (default)
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="card p-4 cursor-pointer relative hover:shadow-card-md transition-shadow duration-200"
    >
      <div className="flex gap-3">
        <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0", accentBg)}>
          {job.categoryEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {job.isUrgent && <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">URGENT</span>}
                <Badge variant={statusColor.variant} className="text-[10px]">{statusColor.label}</Badge>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight line-clamp-2">{job.title}</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1">
                {job.isVerifiedEmployer && <Shield size={10} className={isWorker ? "text-green-500" : "text-blue-500"} />}
                {job.employerName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={clsx("text-base font-black", accentColor)}>₹{job.payPerWorker}</p>
              <p className="text-[10px] font-bold text-slate-400">/day</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2.5 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {job.reportingTime}</span>
            <span className="flex items-center gap-1"><Users size={11} /> {job.workersNeeded - job.workersHired} left</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {job.foodProvided && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Utensils size={10} /> Food</span>}
            <span className="text-[10px] font-bold text-slate-400">{job.applicantsCount} applicants</span>
            {job.distance && <span className="text-[10px] font-bold text-slate-400">📍 {job.distance}km</span>}
          </div>
        </div>
      </div>
      {onSave && (
        <button
          onClick={e => { e.stopPropagation(); onSave(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-primary-500"
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} className={saved ? 'text-primary-500' : ''} />
        </button>
      )}
    </motion.div>
  );
};

// ============================================================
// WORKER CARD
// ============================================================
interface WorkerCardProps {
  worker: UserProfile & { availableToday?: boolean };
  onClick?: () => void;
  onHire?: () => void;
  compact?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick, onHire, compact }) => {
  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex-shrink-0 w-36 card p-3 text-center cursor-pointer"
      >
        <Avatar src={worker.selfie} name={worker.name} size="lg" online={worker.availableToday} verified={worker.isVerified} />
        <div className="mt-2">
          <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{worker.name.split(' ')[0]}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">{worker.categories?.[0] || 'Worker'}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Star size={10} fill="#f59e0b" stroke="none" />
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{worker.rating}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="card p-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-3">
        <Avatar src={worker.selfie} name={worker.name} size="lg" online={worker.availableToday} verified={worker.isVerified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{worker.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{(worker.categories || []).join(', ')}</p>
            </div>
            <div className="text-right">
              <Rating value={worker.rating} />
              <p className="text-[10px] text-slate-400 mt-0.5">({worker.reviewCount} reviews)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
            <span className="flex items-center gap-1"><MapPin size={11} /> {worker.city}</span>
            <span>{worker.completedJobs} jobs done</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={worker.isVerified ? 'success' : 'gray'} dot>{worker.isVerified ? 'Verified' : 'Unverified'}</Badge>
            {worker.availableToday && <Badge variant="primary" dot>Available Today</Badge>}
            {(worker.categories || []).slice(0, 2).map(c => (
              <span key={c} className="text-[10px] font-bold bg-slate-100 dark:bg-dark-500 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        </div>
      </div>
      {onHire && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={e => { e.stopPropagation(); onHire(); }}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-extrabold rounded-xl shadow-primary"
        >
          Hire {worker.name.split(' ')[0]}
        </motion.button>
      )}
    </motion.div>
  );
};

// ============================================================
// APPLICATION CARD
// ============================================================
import type { Application } from '../../types';

interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
}

const APP_STATUS_CONFIG = {
  applied:     { label: 'Applied',     variant: 'primary'  as const, emoji: '📬' },
  shortlisted: { label: 'Shortlisted', variant: 'warning'  as const, emoji: '⭐' },
  accepted:    { label: 'Accepted',    variant: 'success'  as const, emoji: '✅' },
  rejected:    { label: 'Rejected',    variant: 'danger'   as const, emoji: '❌' },
  completed:   { label: 'Completed',   variant: 'gray'     as const, emoji: '🏁' },
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onClick }) => {
  const config = APP_STATUS_CONFIG[application.status];
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="card p-4 cursor-pointer" onClick={onClick}>
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl flex-shrink-0">
          {application.job.categoryEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{application.job.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{application.job.employerName}</p>
            </div>
            <Badge variant={config.variant}>{config.emoji} {config.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1"><MapPin size={11} />{application.job.location}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{application.job.date}</span>
          </div>
          <p className="text-sm font-black text-primary-600 dark:text-primary-400 mt-2">₹{application.job.payPerWorker}</p>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// CATEGORY CAROUSEL TILE
// ============================================================
interface CategoryTileProps {
  emoji: string;
  name: string;
  color: string;
  bgColor: string;
  active?: boolean;
  onClick?: () => void;
}

export const CategoryTile: React.FC<CategoryTileProps> = ({ emoji, name, color, bgColor, active, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.92 }}
    onClick={onClick}
    className={clsx(
      'flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200',
      active
        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
        : 'border-slate-100 dark:border-dark-500 bg-white dark:bg-dark-600'
    )}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: bgColor }}>
      {emoji}
    </div>
    <span className={clsx('text-[11px] font-bold whitespace-nowrap', active ? 'text-primary-600' : 'text-slate-600 dark:text-slate-400')}>{name}</span>
  </motion.button>
);
