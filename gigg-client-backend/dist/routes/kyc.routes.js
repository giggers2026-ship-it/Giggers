"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const kyc_controller_1 = require("../controllers/kyc.controller");
const router = (0, express_1.Router)();
router.post('/submit', auth_1.requireAuth, kyc_controller_1.submitKycHandler);
exports.default = router;
//# sourceMappingURL=kyc.routes.js.map