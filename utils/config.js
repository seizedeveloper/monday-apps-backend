import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const google_forms_secret = process.env.google_forms_secret;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const secretToken=process.env.secret_token;
export const MONGODB_URI= process.env.MONGODB_URI;

// SendGrid Configuration
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const FROM_EMAIL = process.env.FROM_EMAIL || "notifications@smartnotify.app";
export const SENDGRID_FREE_MODE = process.env.SENDGRID_FREE_MODE === 'true';
export const SENDGRID_FREE_DAILY_LIMIT = parseInt(process.env.SENDGRID_FREE_DAILY_LIMIT || '100', 10);

// Monday.com Configuration
export const MONDAY_SIGNING_SECRET = process.env.MONDAY_SIGNING_SECRET;
export const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;