import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToastData, ThemeMode } from '../types';

interface UIState {
  theme: ThemeMode;
  toasts: ToastData[];
  notificationCount: number;
  isNavVisible: boolean;
  pushNotificationsEnabled: boolean;
  smsAlertsEnabled: boolean;
  soundEnabled: boolean;
  appLanguage: string;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
  addToast: (message: string, type?: ToastData['type']) => void;
  removeToast: (id: string) => void;
  setNavVisible: (v: boolean) => void;
  setNotificationCount: (n: number) => void;
  togglePushNotifications: () => void;
  toggleSmsAlerts: () => void;
  toggleSound: () => void;
  setAppLanguage: (lang: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'light',
      toasts: [],
      notificationCount: 3,
      isNavVisible: true,
      pushNotificationsEnabled: true,
      smsAlertsEnabled: true,
      soundEnabled: true,
      appLanguage: 'English',
      toggleTheme: () => set(s => {
        const next = s.theme === 'light' ? 'dark' : 'light';
        if (next === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return { theme: next };
      }),
      setTheme: (t) => {
        if (t === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        set({ theme: t });
      },
      addToast: (message, type = 'success') => {
        const id = `toast-${Date.now()}`;
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500);
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
      setNavVisible: (v) => set({ isNavVisible: v }),
      setNotificationCount: (n) => set({ notificationCount: n }),
      togglePushNotifications: () => set(s => ({ pushNotificationsEnabled: !s.pushNotificationsEnabled })),
      toggleSmsAlerts: () => set(s => ({ smsAlertsEnabled: !s.smsAlertsEnabled })),
      toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
      setAppLanguage: (lang) => set({ appLanguage: lang }),
    }),
    {
      name: 'giggers-ui',
      partialize: (s) => ({
        theme: s.theme,
        pushNotificationsEnabled: s.pushNotificationsEnabled,
        smsAlertsEnabled: s.smsAlertsEnabled,
        soundEnabled: s.soundEnabled,
        appLanguage: s.appLanguage
      })
    }
  )
);
