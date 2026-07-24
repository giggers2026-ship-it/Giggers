"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadUrl = getUploadUrl;
exports.registerRecording = registerRecording;
exports.getRecordingUrl = getRecordingUrl;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
const supabase_1 = require("../utils/supabase");
const storage_1 = require("../utils/storage");
const RECORDINGS_BUCKET = process.env.SUPABASE_RECORDINGS_BUCKET || 'job-recordings';
const SIGNED_URL_TTL_SECONDS = 60 * 10;
async function authorizeThreadAccess(userId, threadId) {
    const { data: thread } = await supabase_1.supabase
        .from('chat_threads')
        .select('employer_id, worker_id')
        .eq('id', threadId)
        .single();
    if (!thread)
        return false;
    return thread.employer_id === userId || thread.worker_id === userId;
}
// POST /api/recordings/upload-url — returns a pre-signed upload URL so the
// browser can PUT the video file directly to Supabase Storage, bypassing
// the Express JSON body-size limit entirely.
async function getUploadUrl(req, res) {
    const parsed = zod_1.z.object({ threadId: zod_1.z.string().uuid(), extension: zod_1.z.string().max(10).optional() }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const { threadId, extension } = parsed.data;
    const allowed = await authorizeThreadAccess(req.user.id, threadId);
    if (!allowed) {
        res.status(403).json({ error: 'Not authorized for this chat thread' });
        return;
    }
    const ext = (extension || 'webm').replace(/[^a-zA-Z0-9]/g, '');
    const path = `${threadId}/${(0, crypto_1.randomUUID)()}.${ext}`;
    const { data, error } = await supabase_1.supabase.storage.from(RECORDINGS_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
        res.status(500).json({ error: error?.message || 'Failed to create upload URL' });
        return;
    }
    res.json({ path, uploadUrl: data.signedUrl, token: data.token });
}
// POST /api/recordings — registers an uploaded recording as a chat_messages row
async function registerRecording(req, res) {
    const parsed = zod_1.z.object({
        threadId: zod_1.z.string().uuid(),
        path: zod_1.z.string().min(1),
        durationSeconds: zod_1.z.number().int().positive().optional(),
        jobTaskId: zod_1.z.string().uuid().optional(),
    }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0].message });
        return;
    }
    const { threadId, path, durationSeconds, jobTaskId } = parsed.data;
    const allowed = await authorizeThreadAccess(req.user.id, threadId);
    if (!allowed) {
        res.status(403).json({ error: 'Not authorized for this chat thread' });
        return;
    }
    const { data: message, error } = await supabase_1.supabase
        .from('chat_messages')
        .insert({
        thread_id: threadId,
        sender_id: req.user.id,
        type: 'video',
        video_path: path,
        video_duration_seconds: durationSeconds || null,
        job_task_id: jobTaskId || null,
        is_read: false,
    })
        .select('*')
        .single();
    if (error || !message) {
        res.status(500).json({ error: error?.message || 'Failed to register recording' });
        return;
    }
    await supabase_1.supabase.from('chat_threads').update({
        last_message: '🎥 Video recording',
        last_message_at: new Date().toISOString(),
    }).eq('id', threadId);
    const videoUrl = await (0, storage_1.getSignedUrl)(RECORDINGS_BUCKET, message.video_path);
    res.json({
        message: {
            id: message.id,
            threadId: message.thread_id,
            senderId: message.sender_id,
            type: message.type,
            videoUrl,
            jobTaskId: message.job_task_id,
            sentAt: message.sent_at,
            isRead: message.is_read,
        },
    });
}
// GET /api/recordings/:messageId/url — signed playback URL for a recording
async function getRecordingUrl(req, res) {
    const { messageId } = req.params;
    const { data: message } = await supabase_1.supabase.from('chat_messages').select('video_path, thread_id').eq('id', messageId).single();
    if (!message || !message.video_path) {
        res.status(404).json({ error: 'Recording not found' });
        return;
    }
    const allowed = await authorizeThreadAccess(req.user.id, message.thread_id);
    if (!allowed) {
        res.status(403).json({ error: 'Not authorized' });
        return;
    }
    const videoUrl = await (0, storage_1.getSignedUrl)(RECORDINGS_BUCKET, message.video_path);
    res.json({ videoUrl });
}
//# sourceMappingURL=recordings.controller.js.map