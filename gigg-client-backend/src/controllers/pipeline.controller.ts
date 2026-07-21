import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../types';
import { supabase } from '../utils/supabase';
import { uploadTaskImage, getSignedTaskImageUrl } from '../utils/storage';

function mapTask(row: Record<string, any>) {
  return {
    id: row.id,
    jobId: row.job_id,
    kind: row.kind,
    sortOrder: row.sort_order,
    title: row.title || '',
    description: row.description || '',
    completionType: row.completion_type,
    formSchema: row.form_schema || undefined,
    responseWindowMinutes: row.response_window_minutes,
    autoFailMinutes: row.auto_fail_minutes,
    requiresReview: Boolean(row.requires_review),
  };
}

async function mapCompletion(row: Record<string, any>) {
  const imageUrl = await getSignedTaskImageUrl(row.image_path);
  return {
    id: row.id,
    applicationId: row.application_id,
    jobTaskId: row.job_task_id,
    status: row.status,
    imageUrl,
    formData: row.form_data || undefined,
    submittedAt: row.submitted_at || undefined,
    reviewedAt: row.reviewed_at || undefined,
    rejectionReason: row.rejection_reason || undefined,
  };
}

/** Applies the auto-fail rule: any 'submitted' or 'in_progress' row whose
 * available_at + auto_fail_minutes has passed becomes 'failed'. Lazy check
 * on read, no cron needed. */
async function applyAutoFail(completions: Record<string, any>[], tasksById: Map<string, Record<string, any>>) {
  const now = Date.now();
  const toFail: string[] = [];
  for (const c of completions) {
    if (c.status !== 'in_progress' && c.status !== 'submitted') continue;
    if (!c.available_at) continue;
    const task = tasksById.get(c.job_task_id);
    if (!task) continue;
    const deadline = new Date(c.available_at).getTime() + task.auto_fail_minutes * 60_000;
    if (now > deadline) {
      c.status = 'failed';
      toFail.push(c.id);
    }
  }
  if (toFail.length > 0) {
    await supabase.from('application_task_completions').update({ status: 'failed' }).in('id', toFail);
  }
}

// GET /api/pipeline/jobs/:jobId/tasks
export async function listJobTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { jobId } = req.params;
  const { data, error } = await supabase
    .from('job_tasks')
    .select('*')
    .eq('job_id', jobId)
    .order('sort_order', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ tasks: (data || []).map(mapTask) });
}

const taskInputSchema = z.object({
  kind: z.enum(['opening', 'task', 'closing']),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  completionType: z.enum(['image', 'form', 'tick']),
  formSchema: z.array(z.object({ label: z.string(), type: z.enum(['text', 'number', 'select']), options: z.array(z.string()).optional() })).optional(),
  responseWindowMinutes: z.number().int().positive().optional().default(5),
  autoFailMinutes: z.number().int().positive().optional().default(10),
  requiresReview: z.boolean().optional().default(true),
});

const saveTasksSchema = z.object({
  tasks: z.array(taskInputSchema).min(2), // at minimum an opening + closing task
});

// POST /api/pipeline/jobs/:jobId/tasks — replaces the full task list for a job
export async function saveJobTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { jobId } = req.params;
  const parsed = saveTasksSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { data: job } = await supabase.from('jobs').select('id, employer_id').eq('id', jobId).single();
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
    return;
  }
  if (job.employer_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the job owner can edit its pipeline' });
    return;
  }

  const { tasks } = parsed.data;
  if (tasks[0].kind !== 'opening' || tasks[tasks.length - 1].kind !== 'closing') {
    res.status(400).json({ error: 'First task must be the opening task and the last must be the closing task' });
    return;
  }

  // Replace-all: delete existing tasks (cascades to completions) and insert the new set.
  await supabase.from('job_tasks').delete().eq('job_id', jobId);

  const rows = tasks.map((t, i) => ({
    job_id: jobId,
    kind: t.kind,
    sort_order: i,
    title: t.title,
    description: t.description,
    completion_type: t.completionType,
    form_schema: t.formSchema || null,
    response_window_minutes: t.responseWindowMinutes,
    auto_fail_minutes: t.autoFailMinutes,
    requires_review: t.requiresReview,
  }));

  const { data: inserted, error } = await supabase.from('job_tasks').insert(rows).select('*').order('sort_order', { ascending: true });
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ tasks: (inserted || []).map(mapTask) });
}

// PATCH /api/pipeline/tasks/:taskId
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { taskId } = req.params;
  const parsed = taskInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { data: task } = await supabase.from('job_tasks').select('*, jobs!inner(employer_id)').eq('id', taskId).single();
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  if ((task as any).jobs.employer_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the job owner can edit its pipeline' });
    return;
  }

  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.title !== undefined) updates.title = d.title;
  if (d.description !== undefined) updates.description = d.description;
  if (d.completionType !== undefined) updates.completion_type = d.completionType;
  if (d.formSchema !== undefined) updates.form_schema = d.formSchema;
  if (d.responseWindowMinutes !== undefined) updates.response_window_minutes = d.responseWindowMinutes;
  if (d.autoFailMinutes !== undefined) updates.auto_fail_minutes = d.autoFailMinutes;
  if (d.requiresReview !== undefined) updates.requires_review = d.requiresReview;

  const { data: updated, error } = await supabase.from('job_tasks').update(updates).eq('id', taskId).select('*').single();
  if (error || !updated) {
    res.status(500).json({ error: error?.message || 'Failed to update task' });
    return;
  }
  res.json({ task: mapTask(updated) });
}

// DELETE /api/pipeline/tasks/:taskId
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { taskId } = req.params;
  const { data: task } = await supabase.from('job_tasks').select('*, jobs!inner(employer_id)').eq('id', taskId).single();
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  if ((task as any).jobs.employer_id !== req.user!.id) {
    res.status(403).json({ error: 'Only the job owner can edit its pipeline' });
    return;
  }
  if (task.kind !== 'task') {
    res.status(400).json({ error: 'Cannot delete the opening or closing task' });
    return;
  }

  await supabase.from('job_tasks').delete().eq('id', taskId);
  res.json({ success: true });
}

async function authorizeCompletionAccess(req: AuthenticatedRequest, applicationId: string): Promise<{ ok: boolean; isWorker: boolean; isEmployer: boolean }> {
  const { data: application } = await supabase
    .from('applications')
    .select('worker_id, job_id, jobs!inner(employer_id)')
    .eq('id', applicationId)
    .single();

  if (!application) return { ok: false, isWorker: false, isEmployer: false };

  const userId = req.user!.id;
  const isWorker = application.worker_id === userId;
  const isEmployer = (application as any).jobs.employer_id === userId;

  if (isWorker || isEmployer) return { ok: true, isWorker, isEmployer };

  // Read-only clients: allowed if they've been invited to this specific job.
  if (req.user!.role === 'client') {
    const { data: invite } = await supabase
      .from('job_clients')
      .select('id')
      .eq('job_id', application.job_id)
      .eq('phone', req.user!.phone)
      .maybeSingle();
    if (invite) return { ok: true, isWorker: false, isEmployer: false };
  }

  return { ok: false, isWorker: false, isEmployer: false };
}

const LEGACY_SEED_TASKS = [
  { kind: 'opening' as const, title: 'Reporting', description: 'Report at the venue on time', completion_type: 'tick' as const },
  { kind: 'task' as const, title: 'Take Selfie', description: 'Live tracking selfie at the venue', completion_type: 'image' as const },
  { kind: 'task' as const, title: 'Check T-Shirt', description: 'Confirm uniform t-shirt', completion_type: 'image' as const },
  { kind: 'closing' as const, title: 'Shoes Check', description: 'Confirm black shoes and close out', completion_type: 'image' as const },
];

/** Jobs created before the custom-pipeline feature shipped have no
 * job_tasks rows. Seed them once, lazily, with the legacy fixed 4-step
 * list so old/in-flight jobs keep working under the new pipeline UI. */
async function seedLegacyTasksIfMissing(jobId: string) {
  const { count } = await supabase.from('job_tasks').select('id', { count: 'exact', head: true }).eq('job_id', jobId);
  if (count && count > 0) return;

  const rows = LEGACY_SEED_TASKS.map((t, i) => ({
    job_id: jobId,
    kind: t.kind,
    sort_order: i,
    title: t.title,
    description: t.description,
    completion_type: t.completion_type,
    requires_review: true,
  }));
  await supabase.from('job_tasks').insert(rows);
}

// GET /api/pipeline/applications/:applicationId/completions
export async function getCompletions(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { applicationId } = req.params;
  const access = await authorizeCompletionAccess(req, applicationId);
  if (!access.ok) {
    res.status(403).json({ error: 'Not authorized to view this pipeline' });
    return;
  }

  const { data: applicationRow } = await supabase.from('applications').select('job_id').eq('id', applicationId).single();
  const jobId = applicationRow?.job_id;
  if (!jobId) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  await seedLegacyTasksIfMissing(jobId);

  const { data: tasks } = await supabase.from('job_tasks').select('*').eq('job_id', jobId).order('sort_order', { ascending: true });

  if (!tasks || tasks.length === 0) {
    res.json({ tasks: [], completions: [] });
    return;
  }

  let { data: completions } = await supabase
    .from('application_task_completions')
    .select('*')
    .eq('application_id', applicationId);

  // Lazily create missing completion rows so every task always has one.
  // The very first task (lowest sort_order) starts 'in_progress' and available
  // immediately; every later task starts 'not_started' (locked) until the
  // task before it completes (see advanceNextTask).
  const existingTaskIds = new Set((completions || []).map((c) => c.job_task_id));
  const missing = tasks.filter((t) => !existingTaskIds.has(t.id));
  const isFirstEverCreation = (completions || []).length === 0;
  if (missing.length > 0) {
    const newRows = missing.map((t) => {
      const isFirstTask = t.sort_order === tasks[0].sort_order;
      const startsInProgress = isFirstEverCreation && isFirstTask;
      return {
        application_id: applicationId,
        job_task_id: t.id,
        status: startsInProgress ? 'in_progress' : 'not_started',
        available_at: startsInProgress ? new Date().toISOString() : null,
      };
    });
    const { data: created } = await supabase.from('application_task_completions').insert(newRows).select('*');
    completions = [...(completions || []), ...(created || [])];
  }

  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  await applyAutoFail(completions || [], tasksById);

  const sorted = (completions || []).sort((a, b) => {
    const ta = tasksById.get(a.job_task_id)?.sort_order ?? 0;
    const tb = tasksById.get(b.job_task_id)?.sort_order ?? 0;
    return ta - tb;
  });

  const mappedCompletions = await Promise.all(sorted.map(mapCompletion));
  res.json({ tasks: tasks.map(mapTask), completions: mappedCompletions });
}

async function advanceNextTask(applicationId: string, completedTaskId: string) {
  const { data: application } = await supabase.from('applications').select('job_id').eq('id', applicationId).single();
  if (!application) return;

  const { data: tasks } = await supabase.from('job_tasks').select('*').eq('job_id', application.job_id).order('sort_order', { ascending: true });
  if (!tasks) return;

  const idx = tasks.findIndex((t) => t.id === completedTaskId);
  const next = idx >= 0 ? tasks[idx + 1] : undefined;
  if (!next) return;

  await supabase
    .from('application_task_completions')
    .update({ status: 'in_progress', available_at: new Date().toISOString() })
    .eq('application_id', applicationId)
    .eq('job_task_id', next.id)
    .eq('status', 'not_started');
}

// POST /api/pipeline/completions/:completionId/tick
export async function tickCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { completionId } = req.params;
  const { data: completion } = await supabase.from('application_task_completions').select('*').eq('id', completionId).single();
  if (!completion) {
    res.status(404).json({ error: 'Task completion not found' });
    return;
  }
  const access = await authorizeCompletionAccess(req, completion.application_id);
  if (!access.ok) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  const { data: updated, error } = await supabase
    .from('application_task_completions')
    .update({ status: 'complete', submitted_at: new Date().toISOString(), reviewed_at: new Date().toISOString() })
    .eq('id', completionId)
    .select('*')
    .single();

  if (error || !updated) {
    res.status(500).json({ error: error?.message || 'Failed to update task' });
    return;
  }

  await advanceNextTask(completion.application_id, completion.job_task_id);
  res.json({ completion: await mapCompletion(updated) });
}

// POST /api/pipeline/completions/:completionId/form
export async function submitFormCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { completionId } = req.params;
  const parsed = z.object({ formData: z.record(z.union([z.string(), z.number()])) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { data: completion } = await supabase.from('application_task_completions').select('*').eq('id', completionId).single();
  if (!completion) {
    res.status(404).json({ error: 'Task completion not found' });
    return;
  }
  const access = await authorizeCompletionAccess(req, completion.application_id);
  if (!access.isWorker) {
    res.status(403).json({ error: 'Only the assigned worker can submit this task' });
    return;
  }

  const { data: task } = await supabase.from('job_tasks').select('requires_review').eq('id', completion.job_task_id).single();
  const nextStatus = task?.requires_review ? 'submitted' : 'complete';

  const { data: updated, error } = await supabase
    .from('application_task_completions')
    .update({
      status: nextStatus,
      form_data: parsed.data.formData,
      submitted_at: new Date().toISOString(),
      ...(nextStatus === 'complete' ? { reviewed_at: new Date().toISOString() } : {}),
    })
    .eq('id', completionId)
    .select('*')
    .single();

  if (error || !updated) {
    res.status(500).json({ error: error?.message || 'Failed to submit task' });
    return;
  }

  if (nextStatus === 'complete') await advanceNextTask(completion.application_id, completion.job_task_id);
  res.json({ completion: await mapCompletion(updated) });
}

// POST /api/pipeline/completions/:completionId/image
export async function submitImageCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { completionId } = req.params;
  const parsed = z.object({ image: z.string().min(32) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { data: completion } = await supabase.from('application_task_completions').select('*').eq('id', completionId).single();
  if (!completion) {
    res.status(404).json({ error: 'Task completion not found' });
    return;
  }
  const access = await authorizeCompletionAccess(req, completion.application_id);
  if (!access.isWorker) {
    res.status(403).json({ error: 'Only the assigned worker can submit this task' });
    return;
  }

  const { data: task } = await supabase.from('job_tasks').select('requires_review').eq('id', completion.job_task_id).single();
  const nextStatus = task?.requires_review ? 'submitted' : 'complete';

  let imagePath: string;
  try {
    imagePath = await uploadTaskImage(parsed.data.image, req.user!.id, `task-${completion.job_task_id}`);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to upload image' });
    return;
  }

  const { data: updated, error } = await supabase
    .from('application_task_completions')
    .update({
      status: nextStatus,
      image_path: imagePath,
      submitted_at: new Date().toISOString(),
      ...(nextStatus === 'complete' ? { reviewed_at: new Date().toISOString() } : {}),
    })
    .eq('id', completionId)
    .select('*')
    .single();

  if (error || !updated) {
    res.status(500).json({ error: error?.message || 'Failed to submit task' });
    return;
  }

  if (nextStatus === 'complete') await advanceNextTask(completion.application_id, completion.job_task_id);
  res.json({ completion: await mapCompletion(updated) });
}

// POST /api/pipeline/completions/:completionId/review
export async function reviewCompletion(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { completionId } = req.params;
  const parsed = z.object({ approve: z.boolean(), rejectionReason: z.string().optional() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message });
    return;
  }

  const { data: completion } = await supabase.from('application_task_completions').select('*').eq('id', completionId).single();
  if (!completion) {
    res.status(404).json({ error: 'Task completion not found' });
    return;
  }
  const access = await authorizeCompletionAccess(req, completion.application_id);
  if (!access.isEmployer) {
    res.status(403).json({ error: 'Only the employer can review this task' });
    return;
  }
  if (completion.status !== 'submitted') {
    res.status(400).json({ error: 'Task is not awaiting review' });
    return;
  }

  const { approve, rejectionReason } = parsed.data;
  const { data: updated, error } = await supabase
    .from('application_task_completions')
    .update({
      status: approve ? 'complete' : 'failed',
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user!.id,
      rejection_reason: approve ? null : rejectionReason || 'Rejected by employer',
    })
    .eq('id', completionId)
    .select('*')
    .single();

  if (error || !updated) {
    res.status(500).json({ error: error?.message || 'Failed to review task' });
    return;
  }

  if (approve) await advanceNextTask(completion.application_id, completion.job_task_id);
  res.json({ completion: await mapCompletion(updated) });
}

// GET /api/pipeline/completions/:completionId/image-url
export async function getCompletionImageUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { completionId } = req.params;
  const { data: completion } = await supabase.from('application_task_completions').select('*').eq('id', completionId).single();
  if (!completion) {
    res.status(404).json({ error: 'Task completion not found' });
    return;
  }
  const access = await authorizeCompletionAccess(req, completion.application_id);
  if (!access.ok) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  const url = await getSignedTaskImageUrl(completion.image_path);
  res.json({ imageUrl: url });
}
