import { create } from 'zustand';
import type { JobTask, TaskCompletion } from '../types';
import { api } from '../lib/api';

function mapTask(t: any): JobTask {
  return {
    id: t.id,
    jobId: t.jobId,
    kind: t.kind,
    sortOrder: t.sortOrder,
    title: t.title,
    description: t.description,
    completionType: t.completionType,
    formSchema: t.formSchema,
    responseWindowMinutes: t.responseWindowMinutes,
    autoFailMinutes: t.autoFailMinutes,
    requiresReview: t.requiresReview,
  };
}

function mapCompletion(c: any): TaskCompletion {
  return {
    id: c.id,
    applicationId: c.applicationId,
    jobTaskId: c.jobTaskId,
    status: c.status,
    imageUrl: c.imageUrl,
    formData: c.formData,
    submittedAt: c.submittedAt,
    reviewedAt: c.reviewedAt,
    rejectionReason: c.rejectionReason,
  };
}

export interface TaskDraft {
  kind: 'opening' | 'task' | 'closing';
  title: string;
  description: string;
  completionType: 'image' | 'form' | 'tick';
  responseWindowMinutes: number;
  autoFailMinutes: number;
  requiresReview: boolean;
}

interface PipelineState {
  tasks: JobTask[];
  completions: TaskCompletion[];
  isLoading: boolean;
  fetchJobTasks: (jobId: string) => Promise<JobTask[]>;
  saveJobTasks: (jobId: string, tasks: TaskDraft[]) => Promise<void>;
  fetchCompletions: (applicationId: string) => Promise<void>;
  submitTick: (completionId: string) => Promise<void>;
  submitForm: (completionId: string, formData: Record<string, string | number>) => Promise<void>;
  submitImage: (completionId: string, imageDataUrl: string) => Promise<void>;
  reviewCompletion: (completionId: string, approve: boolean, rejectionReason?: string) => Promise<void>;
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  tasks: [],
  completions: [],
  isLoading: false,

  fetchJobTasks: async (jobId: string) => {
    const res = await api.get<{ tasks: any[] }>(`/api/pipeline/jobs/${jobId}/tasks`);
    const tasks = res.tasks.map(mapTask);
    set({ tasks });
    return tasks;
  },

  saveJobTasks: async (jobId: string, tasks: TaskDraft[]) => {
    const res = await api.post<{ tasks: any[] }>(`/api/pipeline/jobs/${jobId}/tasks`, { tasks });
    set({ tasks: res.tasks.map(mapTask) });
  },

  fetchCompletions: async (applicationId: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get<{ tasks: any[]; completions: any[] }>(`/api/pipeline/applications/${applicationId}/completions`);
      set({ tasks: res.tasks.map(mapTask), completions: res.completions.map(mapCompletion), isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  submitTick: async (completionId: string) => {
    const res = await api.post<{ completion: any }>(`/api/pipeline/completions/${completionId}/tick`);
    const updated = mapCompletion(res.completion);
    set((s) => ({ completions: s.completions.map((c) => (c.id === updated.id ? updated : c)) }));
  },

  submitForm: async (completionId: string, formData: Record<string, string | number>) => {
    const res = await api.post<{ completion: any }>(`/api/pipeline/completions/${completionId}/form`, { formData });
    const updated = mapCompletion(res.completion);
    set((s) => ({ completions: s.completions.map((c) => (c.id === updated.id ? updated : c)) }));
  },

  submitImage: async (completionId: string, imageDataUrl: string) => {
    const res = await api.post<{ completion: any }>(`/api/pipeline/completions/${completionId}/image`, { image: imageDataUrl });
    const updated = mapCompletion(res.completion);
    set((s) => ({ completions: s.completions.map((c) => (c.id === updated.id ? updated : c)) }));
  },

  reviewCompletion: async (completionId: string, approve: boolean, rejectionReason?: string) => {
    const res = await api.post<{ completion: any }>(`/api/pipeline/completions/${completionId}/review`, { approve, rejectionReason });
    const updated = mapCompletion(res.completion);
    set((s) => ({ completions: s.completions.map((c) => (c.id === updated.id ? updated : c)) }));
  },
}));
