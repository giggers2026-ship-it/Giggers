import React, { useRef, useState } from 'react';
import { Video, Square, X } from 'lucide-react';
import { Button } from '../../../components/ui';
import { useRecordingStore } from '../../../store/recordingStore';
import { useChatStore } from '../../../store/chatStore';
import { useUIStore } from '../../../store/uiStore';

const MAX_RECORDING_SECONDS = 90;

interface RecordingRecorderProps {
  threadId: string;
  jobTaskId?: string;
  onClose: () => void;
}

export function RecordingRecorder({ threadId, jobTaskId, onClose }: RecordingRecorderProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { uploadRecording, isUploading } = useRecordingStore();
  const { appendMessage } = useChatStore();
  const { addToast } = useUIStore();

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      const recorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : undefined });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      setIsRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setElapsed(secs);
        if (secs >= MAX_RECORDING_SECONDS) stopRecording();
      }, 500);
    } catch {
      setError('Unable to access camera. Please allow camera and microphone permission.');
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setIsRecording(false);
    stopStream();

    recorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'video/webm' });
      try {
        const message = await uploadRecording(threadId, blob, elapsed, jobTaskId);
        appendMessage(message);
        addToast('Recording sent', 'success');
        onClose();
      } catch {
        addToast('Failed to upload recording', 'error');
      }
    };
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <button onClick={handleClose} className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center">
        <X size={18} />
      </button>

      <div className="flex-1 flex items-center justify-center">
        {error ? (
          <p className="text-white text-sm font-semibold px-8 text-center">{error}</p>
        ) : (
          <video ref={videoRef} muted playsInline className="w-full h-full object-cover" />
        )}
      </div>

      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white text-xs font-bold">{elapsed}s / {MAX_RECORDING_SECONDS}s</span>
        </div>
      )}

      <div className="p-6 flex justify-center">
        {!isRecording ? (
          <Button size="lg" onClick={startRecording} loading={isUploading} leftIcon={<Video size={18} />}>
            Start Recording
          </Button>
        ) : (
          <Button size="lg" variant="danger" onClick={stopRecording} leftIcon={<Square size={16} />}>
            Stop & Send
          </Button>
        )}
      </div>
    </div>
  );
}
