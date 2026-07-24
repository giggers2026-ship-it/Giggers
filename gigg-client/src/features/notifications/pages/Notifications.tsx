import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../../../components/layout/Navigation';
import { useNotificationStore } from '../../../store/notificationStore';
import { useAuthStore } from '../../../store/authStore';
import { Bell, Briefcase, Wallet, Star, BellRing, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState, Button } from '../../../components/ui';
import { getNotificationPermissionState, subscribeToWebPush, sendTestPush } from '../../../lib/pushNotifications';

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, fetchNotifications, markAllAsRead, isLoading } = useNotificationStore();
  const { user, token } = useAuthStore();

  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [subscribing, setSubscribing] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setPermissionState(getNotificationPermissionState());
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.id);
      return () => { markAllAsRead(user.id); };
    }
  }, [user?.id, fetchNotifications, markAllAsRead]);

  const handleEnablePush = async () => {
    if (!token) return;
    setSubscribing(true);
    setPushStatusMsg(null);

    const res = await subscribeToWebPush(token);
    setSubscribing(false);
    setPermissionState(getNotificationPermissionState());

    if (res.success) {
      setPushStatusMsg({ type: 'success', text: 'Live push notifications enabled!' });
      // Send a test push
      await sendTestPush(token);
    } else {
      setPushStatusMsg({ type: 'error', text: res.message || 'Failed to enable push notifications.' });
    }
  };

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

      <div className="px-5 pt-4 flex flex-col gap-4">
        {/* Push Notification Opt-in Card */}
        {permissionState !== 'granted' && permissionState !== 'unsupported' && (
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
              <BellRing size={140} />
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0 text-white shadow-inner">
                <BellRing size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-base leading-tight">Get Live Job & Payment Alerts</h3>
                <p className="text-xs text-primary-100 mt-1 font-medium leading-relaxed">
                  Turn on browser notifications so you never miss a new gig in Chennai or an instant payout.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={handleEnablePush}
                    disabled={subscribing}
                    className="bg-white text-primary-700 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    {subscribing ? <Loader2 size={14} className="animate-spin" /> : <BellRing size={14} />}
                    {subscribing ? 'Enabling...' : 'Enable Push Alerts'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {permissionState === 'granted' && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-3.5 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex-1">
              Browser push notifications are active for live gig alerts.
            </p>
          </div>
        )}

        {pushStatusMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${pushStatusMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {pushStatusMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {pushStatusMsg.text}
          </div>
        )}

        {/* Notifications List */}
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
