import { webhookService } from "../services/index.js"
import catchAsync from "../utils/catchAsync.js"
import mondaySdk from 'monday-sdk-js';
import WebhookEvent from '../models/WebhookEvent.js'


const editData = catchAsync(async (req, res) => {
  try {
    const monday = mondaySdk();
    monday.setApiVersion("2025-04");

    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const event = req.body;
    if (!event || !event.data) return res.status(400).json({ error: "Invalid webhook structure" });

    const { app_name, user_email, user_id, account_tier, account_id } = event.data;

    // Create and save document
    const savedEvent = await WebhookEvent.create({
      app_name,
      event_type: event.type,
      user_email,
      user_id,
      account_tier,
      account_id,
    });

    console.log("Webhook event saved:", savedEvent);

    res.status(200).json({ success: true, message: "Webhook event saved", data: savedEvent });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});


export default { editData };
