import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Button } from '../../../components/ui';
import { useJobStore } from '../../../store/jobStore';
import { usePipelineStore } from '../../../store/pipelineStore';
import { useUIStore } from '../../../store/uiStore';
import { CheckCircle2, Circle, Clock, XCircle, UserSquare2, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import type { TaskCompletion } from '../../../types';

function StatusIcon({ status }: { status: TaskCompletion['status'] }) {
  if (status === 'complete') return <CheckCircle2 size={20} />;
  if (status === 'failed') return <XCircle size={20} />;
  if (status === 'submitted' || status === 'in_progress') return <Clock size={20} />;
  return <Circle size={20} />;
}

const STATUS_STYLES: Record<TaskCompletion['status'], string> = {
  complete: 'bg-green-500 border-green-200 dark:border-green-900/50 text-white',
  failed: 'bg-red-500 border-red-200 dark:border-red-900/50 text-white',
  submitted: 'bg-amber-400 border-amber-100 dark:border-amber-900/50 text-white',
  in_progress: 'bg-amber-400 border-amber-100 dark:border-amber-900/50 text-white',
  not_started: 'bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-600 text-slate-400',
};

export default function PipelineManager() {
  const { jobId, workerId } = useParams();
  const navigate = useNavigate();
  const { myJobs, jobCandidates, fetchJobCandidates } = useJobStore();
  const { tasks, completions, isLoading, fetchCompletions, submitTick, reviewCompletion } = usePipelineStore();
  const { addToast } = useUIStore();

  const job = myJobs.find((j) => j.id === jobId);
  const application = jobCandidates.find((c) => c.workerId === workerId && c.jobId === jobId);

  useEffect(() => {
    if (jobId && jobCandidates.length === 0) {
      fetchJobCandidates(jobId);
    }
  }, [jobId, jobCandidates.length, fetchJobCandidates]);

  useEffect(() => {
    if (application) {
      fetchCompletions(application.id).catch(() => addToast('Failed to load pipeline', 'error'));
    }
  }, [application?.id]);

  if (!job || !application || isLoading) {
    return <div className="p-5 text-center mt-20 font-bold dark:text-white">Loading pipeline...</div>;
  }

  const completionByTaskId = new Map(completions.map((c) => [c.jobTaskId, c]));
  const allComplete = tasks.length > 0 && tasks.every((t) => completionByTaskId.get(t.id)?.status === 'complete');

  const handleTap = async (completion: TaskCompletion | undefined) => {
    if (!completion) return;
    if (completion.status === 'complete' || completion.status === 'failed') return;
    if (completion.status === 'submitted') return; // handled via approve/reject buttons instead
    try {
      await submitTick(completion.id);
      addToast('Task marked complete', 'success');
    } catch {
      addToast('Failed to update task', 'error');
    }
  };

  const handleReview = async (completion: TaskCompletion, approve: boolean) => {
    try {
      await reviewCompletion(completion.id, approve, approve ? undefined : 'Rejected by employer');
      addToast(approve ? 'Task approved' : 'Task rejected', approve ? 'success' : 'warning');
    } catch {
      addToast('Failed to review task', 'error');
    }
  };

  const handleMarkPresent = () => {
    if (!allComplete) {
      addToast('Please complete all tasks first', 'warning');
      return;
    }
    addToast('Worker marked as Present!', 'success');
    navigate(-1);
  };

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="Pipeline" showBack onBack={() => navigate(-1)} />

      <div className="px-5 pt-6">
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

        <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-dark-700">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Job Pipeline</h3>

          <div className="flex flex-col relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 dark:before:via-dark-600 before:to-transparent">
            {tasks.map((task) => {
              const completion = completionByTaskId.get(task.id);
              const status = completion?.status || 'not_started';
              return (
                <div key={task.id} className="relative flex items-start justify-between mb-6 last:mb-0">
                  <div
                    onClick={() => handleTap(completion)}
                    className={clsx(
                      'flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 cursor-pointer z-10 transition-colors',
                      STATUS_STYLES[status]
                    )}
                  >
                    <StatusIcon status={status} />
                  </div>

                  <div className="w-[calc(100%-3.5rem)] p-4 rounded-xl border border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 shadow-sm ml-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-500">
                        {task.kind === 'opening' ? 'Opening' : task.kind === 'closing' ? 'Closing' : 'Task'}
                      </span>
                      {task.completionType === 'image' && <ImageIcon size={12} className="text-slate-400" />}
                    </div>
                    <span className={clsx('font-bold text-sm block', status === 'not_started' ? 'text-slate-500' : 'text-slate-900 dark:text-white')}>
                      {task.title}
                    </span>
                    {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}

                    {completion?.imageUrl && (
                      <img src={completion.imageUrl} alt="submission" className="mt-2 w-full h-32 object-cover rounded-lg" />
                    )}
                    {completion?.formData && (
                      <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                        {Object.entries(completion.formData).map(([k, v]) => (
                          <div key={k}><span className="font-bold">{k}:</span> {String(v)}</div>
                        ))}
                      </div>
                    )}
                    {completion?.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 font-semibold">Rejected: {completion.rejectionReason}</p>
                    )}

                    {status === 'submitted' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="danger" onClick={() => handleReview(completion!, false)}>Reject</Button>
                        <Button size="sm" onClick={() => handleReview(completion!, true)}>Approve</Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md border-t border-slate-100 dark:border-dark-600 z-40 max-w-lg mx-auto">
        <Button fullWidth size="lg" onClick={handleMarkPresent} disabled={!allComplete}>
          {allComplete ? 'Mark as Present' : 'Complete all tasks'}
        </Button>
      </div>
    </div>
  );
}
