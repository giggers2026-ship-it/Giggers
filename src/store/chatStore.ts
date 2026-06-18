import { create } from 'zustand';
import type { ChatThread, ChatMessage } from '../types';
import { supabase } from '../lib/supabase';

interface ChatState {
  threads: ChatThread[];
  activeThread: ChatThread | null;
  messages: ChatMessage[];
  isLoading: boolean;
  fetchThreads: (userId: string) => Promise<void>;
  openThread: (thread: ChatThread) => Promise<void>;
  sendMessage: (threadId: string, senderId: string, text: string) => Promise<void>;
  subscribeToThread: (threadId: string) => () => void;
  markThreadRead: (threadId: string) => void;
}

function mapThread(row: Record<string, unknown>, currentUserId: string): ChatThread {
  const isEmployer = row.employer_id === currentUserId;
  const other = isEmployer
    ? (row.worker_profile as Record<string, unknown> | undefined)
    : (row.employer_profile as Record<string, unknown> | undefined);

  return {
    id: row.id as string,
    jobId: row.job_id as string,
    jobTitle: (row.job_title as string) || '',
    employerId: row.employer_id as string,
    workerId: row.worker_id as string,
    otherPartyId: isEmployer ? (row.worker_id as string) : (row.employer_id as string),
    otherPartyName: (other?.name as string) || 'User',
    otherPartyAvatar: other?.avatar as string | undefined,
    lastMessage: (row.last_message as string) || '',
    lastMessageAt: (row.last_message_at as string) || (row.created_at as string) || new Date().toISOString(),
    unreadCount: 0,
  };
}

function mapMessage(row: Record<string, unknown>): ChatMessage {
  return {
    id: row.id as string,
    threadId: row.thread_id as string,
    senderId: row.sender_id as string,
    text: row.text as string | undefined,
    type: (row.type as ChatMessage['type']) || 'text',
    sentAt: row.sent_at as string,
    isRead: Boolean(row.is_read),
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  threads: [],
  activeThread: null,
  messages: [],
  isLoading: false,

  fetchThreads: async (userId: string) => {
    set({ isLoading: true });

    const { data, error } = await supabase
      .from('chat_threads')
      .select(`
        *,
        jobs!chat_threads_job_id_fkey(title),
        employer_profile:profiles!chat_threads_employer_id_fkey(name, avatar),
        worker_profile:profiles!chat_threads_worker_id_fkey(name, avatar)
      `)
      .or(`employer_id.eq.${userId},worker_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      const threads = data.map((row) => {
        const enriched = {
          ...row,
          job_title: (row.jobs as Record<string, unknown> | null)?.title || '',
        } as Record<string, unknown>;
        return mapThread(enriched, userId);
      });
      set({ threads });
    }
    set({ isLoading: false });
  },

  openThread: async (thread: ChatThread) => {
    set({ activeThread: thread, isLoading: true, messages: [] });

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', thread.id)
      .order('sent_at', { ascending: true });

    if (!error && data) {
      set({ messages: data.map((row) => mapMessage(row as unknown as Record<string, unknown>)) });
    }
    set({ isLoading: false });
  },

  sendMessage: async (threadId: string, senderId: string, text: string) => {
    const { error } = await supabase.from('chat_messages').insert({
      thread_id: threadId,
      sender_id: senderId,
      text,
      type: 'text',
      is_read: false,
    });

    if (!error) {
      await supabase
        .from('chat_threads')
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq('id', threadId);

      // Optimistic update to thread list
      set((s) => ({
        threads: s.threads.map((t) =>
          t.id === threadId
            ? { ...t, lastMessage: text, lastMessageAt: new Date().toISOString() }
            : t
        ),
      }));
    }
  },

  subscribeToThread: (threadId: string) => {
    const channel = supabase
      .channel(`chat-thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const msg = mapMessage(payload.new as Record<string, unknown>);
          const { messages, activeThread } = get();
          // Only append if not already present (avoid double-render from our own optimistic sends)
          if (activeThread?.id === threadId && !messages.find((m) => m.id === msg.id)) {
            set({ messages: [...messages, msg] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  markThreadRead: (threadId: string) => {
    set((s) => ({
      threads: s.threads.map((t) => (t.id === threadId ? { ...t, unreadCount: 0 } : t)),
    }));
  },
}));
