import sgMail from "@sendgrid/mail";
import { SENDGRID_API_KEY, FROM_EMAIL, SENDGRID_FREE_MODE, SENDGRID_FREE_DAILY_LIMIT } from "../utils/config.js";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// In-memory counter for free tier limits
let dailyEmailCount = 0;
let lastResetDate = new Date().toDateString();

const checkAndResetDailyCount = () => {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyEmailCount = 0;
    lastResetDate = today;
  }
};

// Send notification email
export const sendNotification = async ({ to, subject, body, fromName = "SmartNotify" }) => {
  checkAndResetDailyCount();

  if (SENDGRID_FREE_MODE && dailyEmailCount >= (SENDGRID_FREE_DAILY_LIMIT || 100)) {
    console.warn(`SendGrid free tier limit reached (${dailyEmailCount} emails today). Skipping email to ${to}.`);
    return {
      success: false,
      error: `SendGrid free tier limit reached (${SENDGRID_FREE_DAILY_LIMIT || 100} emails today).`,
      recipient: to
    };
  }

  if (!SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const fromEmail = FROM_EMAIL || "notifications@smartnotify.app";

  const msg = {
    to: to,
    from: {
      email: fromEmail,
      name: fromName
    },
    subject: subject,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="white-space: pre-wrap;">${body.replace(/\n/g, "<br>")}</div>
    </div>`,
    text: body,
    replyTo: to
  };

  try {
    const result = await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
    dailyEmailCount++;
    return {
      success: true,
      messageId: result[0]?.headers?.["x-message-id"] || "unknown",
      recipient: to
    };
  } catch (error) {
    console.error("SendGrid error:", error);
    if (error.response) {
      console.error("SendGrid response body:", error.response.body);
    }
    
    // Don't throw exception - log error but return success to not break webhook
    return {
      success: false,
      error: error.message,
      recipient: to
    };
  }
};

// Send test email
export const sendTestEmail = async ({ to, subject, body, fromName = "SmartNotify" }) => {
  return sendNotification({ to, subject, body, fromName });
};

