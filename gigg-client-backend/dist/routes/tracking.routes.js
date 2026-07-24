"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const tracking_controller_1 = require("../controllers/tracking.controller");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// Worker pushes GPS ping
router.post('/update', (0, auth_1.requireRole)('worker'), tracking_controller_1.updateLocation);
// Employer views all workers on a job map
router.get('/job/:jobId', (0, auth_1.requireRole)('employer'), tracking_controller_1.getJobLocations);
// Worker checks their distance to job site
router.get('/worker/distance', (0, auth_1.requireRole)('worker'), tracking_controller_1.getWorkerDistance);
// Any authenticated user can reverse-geocode
router.post('/geocode', tracking_controller_1.geocodeHandler);
exports.default = router;
//# sourceMappingURL=tracking.routes.js.map