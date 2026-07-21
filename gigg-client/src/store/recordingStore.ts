import { create } from 'zustand';
import { api } from '../lib/api';
import type { ChatMessage } from '../types';

function mapMessage(m: any): ChatMessage {
  return {
    id: m.id,
    threadId: m.threadId,
    senderId: m.senderId,
    type: m.type,
    videoUrl: m.videoUrl,
    jobTaskId: m.jobTaskId,
    sentAt: m.sentAt,
    isRead: m.isRead,
  };
}

interface RecordingState {
  isUploading: boolean;
  uploadRecording: (threadId: string, blob: Blob, durationSeconds?: number, jobTaskId?: string) => Promise<ChatMessage>;
  fetchRecordingUrl: (messageId: string) => Promise<string | undefined>;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isUploading: false,

  uploadRecording: async (threadId: string, blob: Blob, durationSeconds?: number, jobTaskId?: string) => {
    set({ isUploading: true });
    try {
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      const { path, uploadUrl } = await api.post<{ path: string; uploadUrl: string; token: string }>(
        '/api/recordings/upload-url',
        { threadId, extension }
      );

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': blob.type || 'video/webm' },
        body: blob,
      });
      if (!putRes.ok) throw new Error('Failed to upload recording');

      const res = await api.post<{ message: any }>('/api/recordings', {
        threadId,
        path,
        durationSeconds,
        jobTaskId,
      });

      return mapMessage(res.message);
    } finally {
      set({ isUploading: false });
    }
  },

  fetchRecordingUrl: async (messageId: string) => {
    const res = await api.get<{ videoUrl?: string }>(`/api/recordings/${messageId}/url`);
    return res.videoUrl;
  },
}));
