import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import apiClient from '../api/client';
import { Job, Application, JobPipeline } from '../types';

interface JobDetailData {
  job: Job;
  applicants: Application[];
  pipeline: JobPipeline;
}

function StatusIcon({ status }: { status: string | undefined }) {
  const s = status || 'not_started';
  if (s === 'complete') return <CheckCircle2 size={16} style={{ color: '#4ade80' }} />;
  if (s === 'failed') return <XCircle size={16} style={{ color: '#f87171' }} />;
  if (s === 'submitted' || s === 'in_progress') return <Clock size={16} style={{ color: '#facc15' }} />;
  return <Circle size={16} style={{ color: '#475569' }} />;
}

const JobDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<JobDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<JobDetailData>(`/jobs/${id}`).then((res) => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div>
        <Header title="Job Detail" />
        <div className="p-8" style={{ color: '#64748b' }}>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Header title="Job Detail" />
        <div className="p-8" style={{ color: '#64748b' }}>Job not found.</div>
      </div>
    );
  }

  const { job, applicants, pipeline } = data;
  const hiredApplicants = applicants.filter((a) => a.status === 'confirmed' || a.status === 'completed');
  const totalSlots = hiredApplicants.length * pipeline.tasks.length;
  const completeCount = hiredApplicants.reduce((sum, a) => {
    const completions = pipeline.completionsByApplication[a.id] || [];
    return sum + completions.filter((c) => c.status === 'complete').length;
  }, 0);

  return (
    <div>
      <Header title={job.title} subtitle={`${job.category} · Posted by ${job.profiles?.name || 'Unknown'}`} />
      <div className="p-8">
        <button onClick={() => navigate('/jobs')} className="btn-secondary py-2 px-3 text-xs mb-6 inline-flex items-center gap-1.5">
          <ArrowLeft size={12} /> Back to Jobs
        </button>

        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Pipeline Progress</h3>
          {pipeline.tasks.length === 0 ? (
            <p className="text-sm" style={{ color: '#64748b' }}>No pipeline defined for this job yet.</p>
          ) : (
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {completeCount} / {totalSlots} task completions across {hiredApplicants.length} confirmed worker(s)
            </p>
          )}
        </div>

        {pipeline.tasks.length > 0 && hiredApplicants.map((app) => {
          const completions = pipeline.completionsByApplication[app.id] || [];
          const completionByTaskId = new Map(completions.map((c) => [c.job_task_id, c]));
          return (
            <div key={app.id} className="card p-5 mb-4">
              <h4 className="text-sm font-semibold text-white mb-3">{app.profiles?.name || 'Worker'}</h4>
              <div className="flex flex-col gap-2">
                {pipeline.tasks.map((task) => {
                  const completion = completionByTaskId.get(task.id);
                  return (
                    <div key={task.id} className="flex items-center gap-2.5">
                      <StatusIcon status={completion?.status} />
                      <span className="text-xs" style={{ color: '#cbd5e1' }}>{task.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobDetail;
