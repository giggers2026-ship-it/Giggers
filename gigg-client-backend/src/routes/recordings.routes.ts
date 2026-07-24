import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getUploadUrl, registerRecording, getRecordingUrl } from '../controllers/recordings.controller';

const router = Router();

router.use(requireAuth);

router.post('/upload-url', getUploadUrl);
router.post('/', registerRecording);
router.get('/:messageId/url', getRecordingUrl);

export default router;
