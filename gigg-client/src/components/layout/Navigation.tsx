import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Briefcase, MessageSquare, Wallet, User, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';

// ============================================================
// BOTTOM NAV
// ============================================================
const TABS = [
  { path: '/home',    icon: Home,          label: 'Home' },
  { path: '/jobs',    icon: Briefcase,     label: 'Jobs' },
  { path: '/wallet',  icon: Wallet,        label: 'Wallet' },
  { path: '/chat',    icon: MessageSquare, label: 'Messages' },
  { path: '/profile', icon: User,          label: 'Profile' },
];

export const BottomNav: React.FC = () => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();

  const isWorker = user?.role === 'worker';
  const activeColor = isWorker ? '#22c55e' : '#2563eb';

  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
        {TABS.map((tab) => {
          const isActive = location.pathname.startsWith(tab.path);
          const Icon = tab.icon;

          // Dynamic labels based on worker/employer role
          let displayLabel = tab.label;
          if (tab.path === '/home') {
            displayLabel = isWorker ? 'Home' : 'Dashboard';
          } else if (tab.path === '/jobs') {
            displayLabel = isWorker ? 'My Jobs' : 'Jobs';
          } else if (tab.path === '/wallet') {
            displayLabel = isWorker ? 'Earnings' : 'Wallet';
          }

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center gap-1.5 relative py-1 px-3 min-w-[64px]"
            >
              {({ isActive: navActive }) => {
                const active = navActive || isActive;
                return (
                  <>
                    <div className="relative flex items-center justify-center">
                      <Icon
                        size={20}
                        strokeWidth={active ? 2.5 : 1.8}
                        className="relative z-10 transition-all duration-200"
                        style={{ color: active ? activeColor : '#64748b' }}
                      />

                      {/* Micro-animated dot active indicator */}
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            layoutId="nav-dot"
                            className="absolute -bottom-2.5 w-1.5 h-1.5 rounded-full"
                            style={{ background: activeColor }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          />
                        )}
                      </AnimatePresence>

                      {/* Unread badge */}
                      {tab.path === '/chat' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-dark-900">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </div>

                    <span
                      className="text-[9px] font-extrabold transition-all duration-200 tracking-wide mt-1 uppercase"
                      style={{ color: active ? activeColor : '#64748b' }}
                    >
                      {displayLabel}
                    </span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

// ============================================================
// APP HEADER
// ============================================================
interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  dark?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title, showBack, onBack, rightAction, transparent, dark
}) => {
  return (
    <header className={clsx(
      'sticky top-0 z-40 flex items-center justify-between px-4 py-3.5',
      transparent
        ? 'bg-transparent'
        : dark
          ? 'bg-dark-900 border-b border-slate-800'
          : 'bg-dark-900 border-b border-slate-800/80',
    )}>
      <div className="flex items-center gap-3">
        {showBack && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-dark-800 border border-slate-800 flex items-center justify-center text-slate-300"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </motion.button>
        )}
        {title && (
          <h1 className="text-base font-extrabold text-white tracking-tight">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {rightAction}
      </div>
    </header>
  );
};

// ============================================================
// HOME HEADER
// ============================================================
export const HomeHeader: React.FC<{ name: string; city: string; avatar?: string }> = ({
  name, city, avatar
}) => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const isWorker = user?.role === 'worker';
  const activeColor = isWorker ? '#22c55e' : '#2563eb';

  // Dynamic greetings to match mockup behavior
  const greeting = isWorker ? 'Great to see you!' : 'Good morning!';

  return (
    <header
      className="relative overflow-hidden px-6 pt-12 pb-8 shrink-0 z-40 border-b border-slate-800/50"
      style={{
        background: isWorker
          ? 'linear-gradient(160deg, #052e16 0%, #0f172a 100%)'
          : 'linear-gradient(160deg, #172554 0%, #0f172a 100%)',
      }}
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: isWorker ? '#22c55e' : '#2563eb' }}
      />

      <div className="relative z-10 flex items-center justify-between">
        {/* Hello row on top, Greeting/City on bottom */}
        <div>
          <h1 className="text-xl font-black text-white leading-tight flex items-center gap-1.5">
            Hello, {name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            {greeting}
          </p>
          <p className="text-slate-500 text-[10px] font-bold mt-1.5 flex items-center gap-1">
            <span>📍</span> {city}
          </p>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <NavLink
            to="/notifications"
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative transition-all duration-300 hover:bg-white/10"
          >
            <Bell size={18} className="text-slate-200" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                style={{ background: activeColor }}
              />
            )}
          </NavLink>

          {/* User Avatar */}
          <NavLink
            to="/profile"
            className="w-10 h-10 rounded-xl border-2 overflow-hidden flex-shrink-0 flex items-center justify-center transition-all duration-300"
            style={{ borderColor: isWorker ? 'rgba(34,197,94,0.3)' : 'rgba(37,99,235,0.3)' }}
          >
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center font-black text-white text-base"
                style={{
                  background: isWorker
                    ? 'linear-gradient(135deg, #22c55e, #15803d)'
                    : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
};
