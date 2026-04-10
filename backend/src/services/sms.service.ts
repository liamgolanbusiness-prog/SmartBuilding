// Twilio is lazy-loaded so the module doesn't crash when creds aren't set
// (dev environment / local run without Twilio account).
let client: any = null;

const getClient = () => {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || sid.startsWith('your-')) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const twilio = require('twilio');
  client = twilio(sid, token);
  return client;
};

export const sendSMS = async (to: string, body: string): Promise<void> => {
  const c = getClient();
  if (!c) {
    console.log(`[SMS stub] to=${to} body=${body}`);
    return;
  }
  try {
    await c.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const sendOTP = async (phoneNumber: string, code: string): Promise<void> => {
  const message = `קוד האימות שלך ב-VaadApp: ${code}\nהקוד תקף ל-5 דקות.`;
  await sendSMS(phoneNumber, message);
};
