"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const recordings_controller_1 = require("../controllers/recordings.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/upload-url', recordings_controller_1.getUploadUrl);
router.post('/', recordings_controller_1.registerRecording);
router.get('/:messageId/url', recordings_controller_1.getRecordingUrl);
exports.default = router;
//# sourceMappingURL=recordings.routes.js.map