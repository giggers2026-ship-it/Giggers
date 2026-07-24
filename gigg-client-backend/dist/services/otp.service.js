"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
const axios_1 = __importDefault(require("axios"));
// In-memory OTP store — swap for Redis in production
const otpStore = new Map();
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendViaMSG91(phone, otp) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const senderId = process.env.MSG91_SENDER_ID || 'GIGGAP';
    await axios_1.default.post('https://api.msg91.com/api/v5/otp', { template_id: templateId, mobile: `91${phone}`, otp }, { headers: { authkey: authKey, 'Content-Type': 'application/json' } });
}
async function sendViaTwilio(phone, otp) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;
    await axios_1.default.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, new URLSearchParams({
        From: from,
        To: `+91${phone}`,
        Body: `Your Gigg OTP is ${otp}. Valid for 10 minutes. Do not share.`,
    }), { auth: { username: accountSid, password: authToken } });
}
const DEV_OTP = '1234';
async function sendOtp(phone) {
    // Dev mode — use fixed OTP, no SMS needed
    if (process.env.NODE_ENV === 'development') {
        const expiresAt = Date.now() + 10 * 60 * 1000;
        otpStore.set(phone, { otp: DEV_OTP, expiresAt, attempts: 0 });
        console.log(`[DEV] OTP for ${phone}: ${DEV_OTP}`);
        return;
    }
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(phone, { otp, expiresAt, attempts: 0 });
    if (process.env.MSG91_AUTH_KEY) {
        await sendViaMSG91(phone, otp);
    }
    else if (process.env.TWILIO_ACCOUNT_SID) {
        await sendViaTwilio(phone, otp);
    }
    else {
        throw new Error('No SMS provider configured — set MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID');
    }
}
function verifyOtp(phone, otp) {
    // Dev mode — always accept the fixed OTP without consuming the store
    if (process.env.NODE_ENV === 'development' && otp === DEV_OTP) {
        return true;
    }
    const session = otpStore.get(phone);
    if (!session)
        return false;
    if (Date.now() > session.expiresAt) {
        otpStore.delete(phone);
        return false;
    }
    session.attempts += 1;
    if (session.attempts > 5) {
        otpStore.delete(phone);
        return false;
    }
    if (session.otp !== otp)
        return false;
    otpStore.delete(phone);
    return true;
}
//# sourceMappingURL=otp.service.js.map