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

// Paths that don't need auth and are always accessible
const PUBLIC_PATHS = ['/', '/welcome', '/login', '/register', '/otp', '/forgot-password'];
// Paths that are part of the onboarding flow (auth required, but app features not required)
const ONBOARDING_PATHS = ['/kyc', '/pending'];
// Paths that hide the bottom navigation
const HIDE_NAV_PATHS = ['/welcome', '/login', '/register', '/otp', '/post-job', '/forgot-password', '/kyc', '/pending'];

export const AppShell: React.FC = () => {
  const { isAuthenticated, user, refreshUser } = useAuthStore();
  const { fetchWallet } = useWalletStore();
  const { toasts, removeToast, theme } = useUIStore();
  const { subscribeToNotifications } = useNotificationStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);
  const isOnboardingPath = ONBOARDING_PATHS.includes(location.pathname);

  // 1. Not logged in + trying to access protected route → go to welcome
  useEffect(() => {
    if (!isAuthenticated && !isPublicPath) {
      navigate('/welcome');
    }
  }, [isAuthenticated, isPublicPath, navigate]);

  // 2. Logged in → always refresh user status silently
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated, refreshUser]);

  // 3. KYC gate: new user or rejected → must complete KYC
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      !user.isApproved &&
      (user.kycStatus === 'not_started' || user.kycStatus === 'rejected') &&
      !isPublicPath &&
      !isOnboardingPath &&
      location.pathname !== '/profile'
    ) {
      navigate('/kyc', { replace: true });
    }
  }, [isAuthenticated, user, isPublicPath, isOnboardingPath, location.pathname, navigate]);

  // 4. Already submitted but on /kyc → push to /pending
  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      user.kycStatus === 'submitted' &&
      !user.isApproved &&
      location.pathname === '/kyc'
    ) {
      navigate('/pending', { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // 5. Approved → don't allow sitting on /pending or /kyc
  useEffect(() => {
    if (isAuthenticated && user?.isApproved && isOnboardingPath) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, user?.isApproved, isOnboardingPath, navigate]);

  // Show the pending overlay for submitted-but-not-approved users on protected routes
  const isPendingApproval =
    isAuthenticated &&
    user &&
    !user.isApproved &&
    user.kycStatus === 'submitted' &&
    !isPublicPath &&
    !isOnboardingPath &&
    location.pathname !== '/profile';

  // Wallet + notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWallet();
    }
  }, [isAuthenticated, user, fetchWallet]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const unsubscribe = subscribeToNotifications(user.id);
      return unsubscribe;
    }
  }, [isAuthenticated, user?.id, subscribeToNotifications]);

  // Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const isDetailsPage =
    location.pathname.includes('/jobs/') ||
    location.pathname.includes('/applications/') ||
    location.pathname.includes('/chat/');

  const showNav =
    isAuthenticated &&
    !HIDE_NAV_PATHS.includes(location.pathname) &&
    !isDetailsPage &&
    location.pathname !== '/' &&
    !isPendingApproval;

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
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname + location.search}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          className="max-w-lg mx-auto bg-white dark:bg-dark-900 min-h-screen relative shadow-2xl overflow-x-hidden"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </motion.button>
          )}
        </>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
