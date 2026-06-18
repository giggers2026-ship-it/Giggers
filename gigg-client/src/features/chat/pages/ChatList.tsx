import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppHeader } from '../../../components/layout/Navigation';
import { Avatar, Badge, Skeleton, EmptyState } from '../../../components/ui';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';

export default function ChatList() {
  const navigate = useNavigate();
  const { threads, fetchThreads, isLoading } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) fetchThreads(user.id);
  }, [fetchThreads, user?.id]);

  return (
    <div className="pb-24">
      <AppHeader title="Messages" />

      <div className="px-5 pt-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 card">
              <Skeleton className="w-12 h-12" rounded="full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))
        ) : threads.length > 0 ? (
          threads.map((thread, i) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/chat/${thread.id}`)}
              className="flex gap-4 p-4 card cursor-pointer items-center"
            >
              <Avatar src={thread.otherPartyAvatar} name={thread.otherPartyName} size="md" online />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{thread.otherPartyName}</h3>
                  <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 ml-2">
                    {new Date(thread.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs truncate ${thread.unreadCount > 0 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                    {thread.lastMessage}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-primary-500 text-white text-[10px] font-black rounded-full flex items-center justify-center flex-shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <EmptyState
            emoji="💬"
            title="No messages yet"
            description="When you apply to jobs or hire workers, your conversations will appear here."
          />
        )}
      </div>
    </div>
  );
}
