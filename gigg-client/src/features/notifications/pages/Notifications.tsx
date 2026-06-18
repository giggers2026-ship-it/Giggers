import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { useNotificationStore } from '../../../store/notificationStore';
import { useAuthStore } from '../../../store/authStore';
import { Bell, Briefcase, Wallet, Star } from 'lucide-react';
import { EmptyState } from '../../../components/ui';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAllAsRead, isLoading } = useNotificationStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      return () => { markAllAsRead(user.id); };
    }
  }, [user?.id, fetchNotifications, markAllAsRead]);

  const getIcon = (type: string) => {
    if (type.includes('payment') || type.includes('earning')) return <Wallet size={18} />;
    if (type.includes('review')) return <Star size={18} />;
    if (type.includes('job') || type.includes('applicant') || type.includes('hired') || type.includes('application')) return <Briefcase size={18} />;
    return <Bell size={18} />;
  };

  const getColor = (type: string) => {
    if (type.includes('payment') || type.includes('earning')) return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (type.includes('review')) return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    if (type.includes('reject')) return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400';
  };

  return (
    <div className="pb-24 font-sans">
      <AppHeader title="Notifications" showBack onBack={() => navigate(-1)} rightAction={<button onClick={() => user && markAllAsRead(user.id)} className="text-xs font-bold text-primary-600 dark:text-primary-400">Mark all read</button>} />

      <div className="px-5 pt-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-10 text-slate-400">Loading...</div>
        ) : notifications.length > 0 ? (
          notifications.map((n, i) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white dark:bg-dark-800 rounded-2xl p-4 flex gap-4 border transition-colors ${n.isRead ? 'border-transparent shadow-sm' : 'border-primary-100 dark:border-primary-900/30 bg-primary-50/30 dark:bg-primary-900/10 shadow-card'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight pr-2">{n.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className={`text-xs font-medium leading-relaxed ${n.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{n.message}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />}
            </motion.div>
          ))
        ) : (
          <EmptyState
            emoji="📭"
            title="All caught up!"
            description="You don't have any new notifications."
          />
        )}
      </div>
    </div>
  );
}
