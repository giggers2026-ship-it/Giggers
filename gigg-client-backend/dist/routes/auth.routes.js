"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Strict rate limit on OTP send — prevent SMS abuse
const otpLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: { error: 'Too many OTP requests. Please wait a minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post('/send-otp', otpLimiter, auth_controller_1.sendOtpHandler);
router.post('/verify-otp', auth_controller_1.verifyOtpHandler);
router.get('/me', auth_1.requireAuth, auth_controller_1.meHandler);
router.post('/refresh', auth_1.requireAuth, auth_controller_1.refreshHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map