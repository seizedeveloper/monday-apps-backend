// models/WebhookEvent.js
import mongoose from "mongoose";

const webhookEventSchema = new mongoose.Schema({
  app_name: String,
  event_type: String,
  user_email: String,
  user_id: Number,
  account_tier: String,
  account_id: Number,
  timestamp: { type: Date, default: Date.now }
});

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);

export default WebhookEvent;
