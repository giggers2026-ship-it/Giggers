import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { Avatar, Button, Chip } from '../../../components/ui';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';
import type { Application } from '../../../types';
import { MessageCircle, Briefcase, Star, MapPin, User } from 'lucide-react';
import { useJobStore } from '../../../store/jobStore';

export default function EmployerWorkers() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchChatThreadId } = useJobStore();
  const [workers, setWorkers] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_at,
            worker_id,
            worker_name,
            worker_avatar,
            worker_rating,
            job_id,
            job:jobs!inner(title, employer_id),
            worker_profile:profiles!applications_worker_id_fkey(phone, city, area, skills)
          `)
          .eq('jobs.employer_id', user.id)
          .in('status', ['hired', 'confirmed', 'completed'])
          .order('applied_at', { ascending: false });
          
        if (error) throw error;
        
        // Map the snake_case data back to camelCase Application type
        const mappedData = (data || []).map(row => ({
          id: row.id,
          jobId: row.job_id,
          job: row.job as any,
          workerId: row.worker_id,
          workerName: row.worker_name,
          workerAvatar: row.worker_avatar,
          workerRating: row.worker_rating,
          workerProfile: row.worker_profile as any,
          status: row.status as any,
          appliedAt: row.applied_at,
          updatedAt: row.applied_at
        }));
        
        setWorkers(mappedData);
      } catch (err) {
        console.error('Failed to fetch hired workers:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkers();
  }, [user]);

  return (
    <div className="pb-24 font-sans bg-slate-50 dark:bg-dark-900 min-h-screen">
      <AppHeader title="My Hired Workers" />
      
      <div className="px-5 pt-6 flex flex-col gap-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          A list of all workers you have hired for your jobs.
        </p>

        {loading ? (
          <div className="flex justify-center p-10 text-slate-400">Loading...</div>
        ) : workers.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 text-center shadow-sm border border-slate-100 dark:border-dark-700">
            <User size={48} className="mx-auto text-slate-200 dark:text-dark-600 mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Hires Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              When you hire workers for your jobs, they will appear here.
            </p>
            <Button className="mt-6" onClick={() => navigate('/jobs?tab=postings')}>
              View My Jobs
            </Button>
          </div>
        ) : (
          workers.map(application => (
            <div key={application.id} className="bg-white dark:bg-dark-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-700 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <Avatar src={application.workerProfile?.selfie || application.workerAvatar} name={application.workerName} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate pr-2">{application.workerName}</h4>
                    <Chip variant={application.status === 'completed' ? 'success' : 'primary'} size="sm">
                      {application.status}
                    </Chip>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center text-amber-500 font-bold"><Star size={12} className="mr-0.5 fill-current" /> {application.workerRating || 4.5}</span>
                    {application.workerProfile?.city && (
                      <span className="flex items-center truncate"><MapPin size={12} className="mr-0.5" /> {application.workerProfile.city}</span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Briefcase size={12} className="text-primary-500" />
                    <span className="truncate">{application.job.title}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => navigate(`/jobs/${application.jobId}`)}
                >
                  View Job
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="flex-1"
                  onClick={async () => {
                    if (!user) return;
                    const threadId = await fetchChatThreadId(application.jobId, application.workerId);
                    if (threadId) navigate(`/chat/${threadId}`);
                  }}
                >
                  <MessageCircle size={16} className="mr-1.5" /> Chat
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
