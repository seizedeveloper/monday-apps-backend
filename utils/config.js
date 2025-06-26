import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const google_forms_secret = process.env.google_forms_secret;
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const secretToken=process.env.secret_token;
export const MONGODB_URI= process.env.MONGODB_URI;
