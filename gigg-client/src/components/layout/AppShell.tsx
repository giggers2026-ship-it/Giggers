import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './Navigation';
import { ToastContainer } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { useWalletStore } from '../../store/walletStore';
import { useUIStore } from '../../store/uiStore';
import PendingApproval from '../../features/auth/pages/PendingApproval';
import { useNotificationStore } from '../../store/notificationStore';

export const AppShell: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { fetchWallet } = useWalletStore();
  const { toasts, removeToast, theme } = useUIStore();
  const { subscribeToNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to welcome if not authenticated and not on a public route
  useEffect(() => {
    const publicPaths = ['/', '/welcome', '/login', '/register', '/otp'];
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      navigate('/welcome');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  // Authenticated but not yet approved — block access to all protected routes
  const publicPaths = ['/', '/welcome', '/login', '/register', '/otp'];
  const isPublicPath = publicPaths.includes(location.pathname);
  const isPendingApproval = isAuthenticated && user && !user.isApproved && !isPublicPath;

  // Global wallet fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWallet();
    }
  }, [isAuthenticated, user, fetchWallet]);

  // Global notification subscription
  useEffect(() => {
    if (isAuthenticated && user) {
      const unsubscribe = subscribeToNotifications(user.id);
      return unsubscribe;
    }
  }, [isAuthenticated, user?.id, subscribeToNotifications]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Hide nav on specific pages
  const hideNavPaths = ['/welcome', '/login', '/register', '/otp', '/post-job'];
  const isDetailsPage = location.pathname.includes('/jobs/') || location.pathname.includes('/applications/') || location.pathname.includes('/chat/');
  const showNav = isAuthenticated && !hideNavPaths.includes(location.pathname) && !isDetailsPage && location.pathname !== '/';

  if (isPendingApproval) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white font-sans transition-colors duration-200">
        <div className="max-w-lg mx-auto bg-white dark:bg-dark-900 min-h-screen relative shadow-2xl overflow-x-hidden">
          <PendingApproval />
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white font-sans transition-colors duration-200">
      {/* Page content animates on route change */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          className="max-w-lg mx-auto bg-white dark:bg-dark-900 min-h-screen relative shadow-2xl overflow-x-hidden"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Nav sits OUTSIDE AnimatePresence — stays perfectly still during page transitions */}
      {showNav && (
        <>
          <BottomNav />
          {user?.role === 'employer' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/post-job')}
              className="fixed bottom-[90px] right-6 w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(26,115,232,0.4)] z-50"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </motion.button>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
