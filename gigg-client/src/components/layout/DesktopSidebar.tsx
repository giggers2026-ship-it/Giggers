import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { WORKER_TABS, EMPLOYER_TABS } from './Navigation';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useUIStore } from '../../store/uiStore';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export const DesktopSidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const tabs = user.role === 'employer' ? EMPLOYER_TABS : WORKER_TABS;

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-dark-800 border-r border-slate-100 dark:border-dark-600 z-50 p-6">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate('/home')}>
        <img src="/logo.png" alt="Giggers" className="w-10 h-10 rounded-xl" />
        <div>
          <h1 className="text-xl font-black text-[#01133b] dark:text-white leading-tight">Giggers</h1>
          <p className="text-[10px] font-bold text-slate-400">FIND WORKERS INSTANTLY</p>
        </div>
      </div>

      {/* Post Gig Button for Employers */}
      {user.role === 'employer' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/post-job')}
          className="mb-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-sm"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Post a Gig</span>
        </motion.button>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/home' && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive: navActive }) => {
                const active = navActive || isActive;
                return clsx(
                  'flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all duration-150',
                  active
                    ? (user.role === 'employer'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400')
                    : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-dark-700'
                );
              }}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{tab.label}</span>
              </div>
              {tab.path === '/chat' && unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile Box */}
      <div className="border-t border-slate-100 dark:border-dark-600 pt-4 flex items-center gap-3">
        <NavLink
          to="/profile"
          className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-dark-600 overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0"
        >
          {user.selfie ? (
            <img src={user.selfie} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-black text-sm text-[#01133b]">{user.name.charAt(0)}</span>
          )}
        </NavLink>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-800 dark:text-white truncate">{user.name}</p>
          <p className="text-[10px] font-bold text-slate-400 truncate capitalize">{user.role} Account</p>
        </div>
      </div>
    </aside>
  );
};
