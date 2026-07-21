import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { useJobStore } from '../../../store/jobStore';
import { api } from '../../../lib/api';
import { CheckCircle2, Circle, Clock, XCircle, UserSquare2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { JobTask, TaskCompletion } from '../../../types';

function StatusDot({ status }: { status: TaskCompletion['status'] | undefined }) {
  const s = status || 'not_started';
  if (s === 'complete') return <CheckCircle2 size={18} className="text-green-500" />;
  if (s === 'failed') return <XCircle size={18} className="text-red-500" />;
  if (s === 'submitted' || s === 'in_progress') return <Clock size={18} className="text-amber-500" />;
  return <Circle size={18} className="text-slate-300 dark:text-dark-500" />;
}

interface WorkerPipelineData {
  applicationId: string;
  workerName: string;
  workerAvatar?: string;
  tasks: JobTask[];
  completions: TaskCompletion[];
}

export default function ClientPipelineView() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { jobCandidates, fetchJobCandidates } = useJobStore();
  const [workerData, setWorkerData] = useState<WorkerPipelineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId) fetchJobCandidates(jobId);
  }, [jobId, fetchJobCandidates]);

  useEffect(() => {
    const hired = jobCandidates.filter((c) => c.status === 'hired' || c.status === 'completed');
    if (hired.length === 0) {
      setIsLoading(false);
      return;
    }

    Promise.all(
      hired.map(async (app) => {
        try {
          const res = await api.get<{ tasks: any[]; completions: any[] }>(`/api/pipeline/applications/${app.id}/completions`);
          return {
            applicationId: app.id,
            workerName: app.workerName,
            workerAvatar: app.workerAvatar,
            tasks: res.tasks,
            completions: res.completions,
          } as WorkerPipelineData;
        } catch {
          return { applicationId: app.id, workerName: app.workerName, workerAvatar: app.workerAvatar, tasks: [], completions: [] };
        }
      })
    ).then((data) => {
      setWorkerData(data);
      setIsLoading(false);
    });
  }, [jobCandidates]);

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Live Pipeline" showBack onBack={() => navigate('/client/jobs')} />

      <div className="px-5 pt-6 flex flex-col gap-4">
        {isLoading && <p className="text-center text-slate-500 py-8">Loading...</p>}

        {!isLoading && workerData.length === 0 && (
          <p className="text-center text-slate-500 py-16 font-semibold">No confirmed workers yet.</p>
        )}

        {workerData.map((w) => (
          <div key={w.applicationId} className="bg-white dark:bg-dark-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-dark-700">
            <div className="flex items-center gap-3 mb-4">
              {w.workerAvatar ? (
                <img src={w.workerAvatar} alt={w.workerName} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center text-slate-400">
                  <UserSquare2 size={20} />
                </div>
              )}
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">{w.workerName}</h3>
            </div>

            <div className="flex flex-col gap-2">
              {w.tasks.map((task) => {
                const completion = w.completions.find((c) => c.jobTaskId === task.id);
                return (
                  <div key={task.id} className="flex items-center gap-2.5">
                    <StatusDot status={completion?.status} />
                    <span className={clsx('text-xs font-bold', completion?.status === 'complete' ? 'text-slate-900 dark:text-white' : 'text-slate-500')}>
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
