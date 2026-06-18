import axios from 'axios';

// In-memory OTP store — swap for Redis in production
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendViaMSG91(phone: string, otp: string): Promise<void> {
  const authKey = process.env.MSG91_AUTH_KEY!;
  const templateId = process.env.MSG91_TEMPLATE_ID!;
  const senderId = process.env.MSG91_SENDER_ID || 'GIGGAP';

  await axios.post(
    'https://api.msg91.com/api/v5/otp',
    { template_id: templateId, mobile: `91${phone}`, otp },
    { headers: { authkey: authKey, 'Content-Type': 'application/json' } }
  );
}

async function sendViaTwilio(phone: string, otp: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_PHONE_NUMBER!;

  await axios.post(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    new URLSearchParams({
      From: from,
      To: `+91${phone}`,
      Body: `Your Gigg OTP is ${otp}. Valid for 10 minutes. Do not share.`,
    }),
    { auth: { username: accountSid, password: authToken } }
  );
}

export async function sendOtp(phone: string): Promise<void> {
  const otp = generateOtp();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(phone, { otp, expiresAt, attempts: 0 });

  // Dev bypass — skip SMS in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return;
  }

  // Try MSG91 first, fall back to Twilio
  if (process.env.MSG91_AUTH_KEY) {
    await sendViaMSG91(phone, otp);
  } else if (process.env.TWILIO_ACCOUNT_SID) {
    await sendViaTwilio(phone, otp);
  } else {
    throw new Error('No SMS provider configured — set MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID');
  }
}

export function verifyOtp(phone: string, otp: string): boolean {
  const session = otpStore.get(phone);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    otpStore.delete(phone);
    return false;
  }

  session.attempts += 1;
  if (session.attempts > 5) {
    otpStore.delete(phone);
    return false;
  }

  if (session.otp !== otp) return false;

  otpStore.delete(phone);
  return true;
}
