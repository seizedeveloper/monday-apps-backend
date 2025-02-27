import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const google_forms_secret = process.env.google_forms_secret;
