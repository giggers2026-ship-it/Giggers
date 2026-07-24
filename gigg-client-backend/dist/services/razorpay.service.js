"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRazorpay = getRazorpay;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.verifyPaymentSignature = verifyPaymentSignature;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
let _razorpay = null;
function getRazorpay() {
    if (!_razorpay) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay keys not configured in .env');
        }
        _razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return _razorpay;
}
function verifyWebhookSignature(body, signature) {
    const expected = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
function verifyPaymentSignature(orderId, paymentId, signature) {
    const expected = crypto_1.default
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    return crypto_1.default.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
//# sourceMappingURL=razorpay.service.js.map