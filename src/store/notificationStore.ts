import { create } from 'zustand';
import type { Notification } from '../types';
import { supabase } from '../lib/supabase';

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
}

function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    type: row.type as Notification['type'],
    title: row.title as string,
    message: row.message as string,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at as string,
    actionId: row.action_id as string | undefined,
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  unreadCount: 0,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const notifications = data.map((row) => mapNotification(row as unknown as Record<string, unknown>));
      set({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
    }
    set({ isLoading: false });
  },

  markAsRead: async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    set((s) => {
      const notifications = s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return { notifications, unreadCount: notifications.filter((n) => !n.isRead).length };
    });
  },

  markAllAsRead: async (userId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  subscribeToNotifications: (userId: string) => {
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = mapNotification(payload.new as Record<string, unknown>);
          set((s) => ({
            notifications: [notification, ...s.notifications],
            unreadCount: s.unreadCount + 1,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
