import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoreVertical, Send, Image as ImageIcon, Video, CheckCircle2, Circle, Clock, XCircle, Play } from 'lucide-react';
import { AppHeader } from '../../../components/layout/Navigation';
import { Avatar } from '../../../components/ui';
import { useChatStore } from '../../../store/chatStore';
import { useAuthStore } from '../../../store/authStore';
import { useJobStore } from '../../../store/jobStore';
import { usePipelineStore } from '../../../store/pipelineStore';
import { RecordingRecorder } from '../components/RecordingRecorder';
import { clsx } from 'clsx';

function TaskStatusIcon({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 size={16} className="text-green-500" />;
  if (status === 'failed') return <XCircle size={16} className="text-red-500" />;
  if (status === 'submitted' || status === 'in_progress') return <Clock size={16} className="text-amber-500" />;
  return <Circle size={16} className="text-slate-300 dark:text-dark-500" />;
}

export default function ChatThread() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { threads, messages, openThread, sendMessage, subscribeToThread, markThreadRead, fetchThreads } = useChatStore();
  const { jobCandidates, fetchJobCandidates } = useJobStore();
  const { tasks, completions, fetchCompletions } = usePipelineStore();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'message' | 'pipeline'>('message');
  const [recordingTaskId, setRecordingTaskId] = useState<string | 'general' | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const thread = threads.find((t) => t.id === id);

  useEffect(() => {
    if (user && threads.length === 0) {
      fetchThreads(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    if (thread) {
      openThread(thread);
      markThreadRead(thread.id);
    }
  }, [thread?.id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToThread(id);
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (thread) fetchJobCandidates(thread.jobId);
  }, [thread?.jobId]);

  const application = thread ? jobCandidates.find((c) => c.jobId === thread.jobId && c.workerId === thread.workerId) : undefined;

  useEffect(() => {
    if (activeTab === 'pipeline' && application) {
      fetchCompletions(application.id).catch(() => undefined);
    }
  }, [activeTab, application?.id]);

  if (!thread || !user) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setSending(true);
    await sendMessage(thread.id, user.id, inputText.trim());
    setInputText('');
    setSending(false);
  };

  const completionByTaskId = new Map(completions.map((c) => [c.jobTaskId, c]));

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-dark-900 font-sans">
      <AppHeader
        showBack
        onBack={() => navigate(-1)}
        title={
          <div className="flex items-center gap-3">
            <Avatar src={thread.otherPartyAvatar} name={thread.otherPartyName} size="sm" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                {thread.otherPartyName}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 truncate max-w-[140px]">{thread.jobTitle}</p>
            </div>
          </div> as any
        }
        rightAction={
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
            <MoreVertical size={18} />
          </button>
        }
      />

      <div className="flex bg-white dark:bg-dark-800 border-b border-slate-100 dark:border-dark-600">
        <button
          onClick={() => setActiveTab('message')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-bold transition-colors border-b-2',
            activeTab === 'message' ? 'text-primary-600 border-primary-500' : 'text-slate-400 border-transparent'
          )}
        >
          Message
        </button>
        <button
          onClick={() => setActiveTab('pipeline')}
          className={clsx(
            'flex-1 py-2.5 text-sm font-bold transition-colors border-b-2',
            activeTab === 'pipeline' ? 'text-primary-600 border-primary-500' : 'text-slate-400 border-transparent'
          )}
        >
          Pipeline
        </button>
      </div>

      {activeTab === 'message' ? (
        <>
          <div className="flex-1 overflow-y-auto p-5 pb-safe flex flex-col gap-4">
            {messages.length === 0 && (
              <div className="text-center py-10 text-sm text-slate-400 font-medium">
                No messages yet. Say hello!
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      isMe
                        ? 'bg-primary-500 text-white rounded-br-sm shadow-primary-sm'
                        : 'bg-white dark:bg-dark-700 text-slate-800 dark:text-slate-200 rounded-bl-sm shadow-sm border border-slate-100 dark:border-dark-600'
                    }`}
                  >
                    {msg.type === 'video' ? (
                      msg.videoUrl ? (
                        <video src={msg.videoUrl} controls className="rounded-lg max-w-full max-h-64" />
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                          <Play size={14} /> Recording unavailable
                        </div>
                      )
                    ) : (
                      msg.text
                    )}
                    <div className={`text-[9px] font-bold mt-1 text-right ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                      {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={endRef} />
          </div>

          <div className="bg-white dark:bg-dark-800 p-4 pb-safe-or-4 border-t border-slate-100 dark:border-dark-600">
            <form onSubmit={handleSend} className="flex gap-2 items-end">
              <button
                type="button"
                onClick={() => setRecordingTaskId('general')}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-slate-400 hover:text-primary-500 bg-slate-50 dark:bg-dark-700 rounded-xl"
              >
                <Video size={20} />
              </button>
              <div className="flex-1 bg-slate-50 dark:bg-dark-700 rounded-2xl border border-slate-100 dark:border-dark-600 px-4 py-1 flex items-center">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white font-medium resize-none max-h-32 py-3 focus:outline-none placeholder:text-slate-400"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-primary-500 text-white rounded-xl shadow-primary disabled:opacity-50 transition-all active:scale-95"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-5">
          {!application ? (
            <p className="text-center text-slate-400 font-semibold py-10">No pipeline for this conversation yet.</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-slate-400 font-semibold py-10">Loading pipeline...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map((task) => {
                const completion = completionByTaskId.get(task.id);
                const status = completion?.status || 'not_started';
                return (
                  <div key={task.id} className="bg-white dark:bg-dark-800 rounded-xl p-3 border border-slate-100 dark:border-dark-700 flex items-center gap-3">
                    <TaskStatusIcon status={status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                    </div>
                    {task.completionType === 'image' && status === 'in_progress' && (
                      <button
                        onClick={() => setRecordingTaskId(task.id)}
                        className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center"
                      >
                        <Video size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {recordingTaskId && (
        <RecordingRecorder
          threadId={thread.id}
          jobTaskId={recordingTaskId === 'general' ? undefined : recordingTaskId}
          onClose={() => setRecordingTaskId(null)}
        />
      )}
    </div>
  );
}
