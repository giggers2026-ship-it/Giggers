import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { useClientStore } from '../../../store/clientStore';
import { Briefcase, MapPin } from 'lucide-react';

export default function ClientJobList() {
  const navigate = useNavigate();
  const { jobs, isLoading, fetchMyClientJobs } = useClientStore();

  useEffect(() => {
    fetchMyClientJobs();
  }, [fetchMyClientJobs]);

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Your Jobs" />

      <div className="px-5 pt-6 flex flex-col gap-3">
        {isLoading && <p className="text-center text-slate-500 py-8">Loading...</p>}

        {!isLoading && jobs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Briefcase size={28} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No jobs shared with you yet</h3>
          </div>
        )}

        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => navigate(`/client/jobs/${job.id}`)}
            className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-700 cursor-pointer flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-xl flex-shrink-0">
              {job.categoryEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {job.location} · {job.date}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
