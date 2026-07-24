"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const push_controller_1 = require("../controllers/push.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.post('/subscribe', push_controller_1.subscribePushHandler);
router.post('/unsubscribe', push_controller_1.unsubscribePushHandler);
router.post('/test-push', push_controller_1.testPushHandler);
exports.default = router;
//# sourceMappingURL=push.routes.js.map