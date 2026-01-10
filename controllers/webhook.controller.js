import { webhookService, emailService, templateService } from "../services/index.js"
import catchAsync from "../utils/catchAsync.js"
import mondaySdk from 'monday-sdk-js';
import WebhookEvent from '../models/WebhookEvent.js'
import Bottleneck from "bottleneck";
import { MONDAY_SIGNING_SECRET } from "../utils/config.js";

// In-memory template storage (shared with templates route)
// In production, replace with database
let templateStorage = null;
export const getTemplateStorage = () => {
  if (!templateStorage) {
    templateStorage = new Map(); // Map<boardId, Map<recipeId, template>>
  }
  return templateStorage;
};

// Rate limiting: max 5 concurrent requests
const limiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 2000 // Minimum time between jobs to prevent overwhelming Monday API or SendGrid
});

// POST /api/v1/webhook
const editData = catchAsync(async (req, res) => {
  // 1) Handle Monday challenge (endpoint verification)
  if (req.body?.challenge) {
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // Always return 200 immediately to Monday to avoid retries,
  // and process the webhook in the background.
  res.status(200).json({ success: true, message: "Webhook received, processing in background." });

  limiter.schedule(async () => {
    try {
      // 2) Verify signature
      const signature = req.headers["authorization"] || req.headers["x-monday-signature"];
      const rawBody = req.rawBody || JSON.stringify(req.body); // Use rawBody captured by middleware
      if (MONDAY_SIGNING_SECRET && !webhookService.verifySignature(rawBody, signature)) {
        console.error("Webhook processing failed: Invalid signature");
        return; // Already responded
      }

      // 3) Parse event
      const event = req.body?.event || req.body;
      if (!event) {
        console.error("Webhook processing failed: Invalid webhook payload");
        return; // Already responded
      }

      // Monday events often have itemId/pulseId and boardId
      const itemId = event.pulseId || event.itemId || event.entityId;
      const boardId = event.boardId || event.board_id || event.sourceBoardId;
      const recipeId = event.recipeId;
      const userId = event.userId || event.user_id; // User who triggered the event

      // 4) Fetch item data (required for email sending)
      let itemData = null;
      if (itemId) {
        try {
          itemData = await webhookService.fetchItemData(itemId);
        } catch (err) {
          console.error(`Failed to fetch item data for item ${itemId}:`, err.message);
          // Continue without item data - will use defaults in template rendering
        }
      }

      // 5) Get template configuration
      let template = null;
      const templateStore = getTemplateStorage();
      if (boardId && templateStore.has(boardId)) {
        const boardTemplates = templateStore.get(boardId);
        // Try to find by recipeId first, then by a generic template for the board
        template = boardTemplates.get(recipeId) || Array.from(boardTemplates.values())[0];
      }

      // 6) Send email if template is configured and itemData is available
      if (template && itemData) {
        try {
          // Render templates
          const renderedSubject = templateService.renderTemplate(
            template.subjectTemplate || template.subject,
            itemData
          );
          const renderedBody = templateService.renderTemplate(
            template.bodyTemplate || template.body,
            itemData
          );

          // Resolve recipients
          const recipientConfig = {
            type: template.recipientType || template.recipientConfig?.type,
            columnId: template.recipientTarget || template.recipientConfig?.columnId,
            staticEmail: template.recipientType === 'static' ? (template.recipientTarget || template.recipientConfig?.staticEmail) : null
          };
          
          const recipients = await webhookService.resolveRecipients(recipientConfig, itemData);
          
          if (recipients.length > 0) {
            // Send emails in parallel
            await Promise.all(recipients.map(async (recipientEmail) => {
              await emailService.sendNotification({
                to: recipientEmail,
                subject: renderedSubject,
                body: renderedBody,
                fromName: template.fromName || "SmartNotify"
              });
            }));
            console.log(`Emails sent to ${recipients.length} recipients for item ${itemId}`);
          } else {
            console.warn(`No recipients found for item ${itemId} with template ${template.id}`);
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
          // Don't fail webhook processing if email fails
        }
      } else {
        console.log(`No template configured for board ${boardId} or item data missing for item ${itemId} - skipping email`);
      }

      // 7) Persist minimal event + enrichment
      try {
        const savedEvent = await WebhookEvent.create({
          app_name: event.app || "smart-notify",
          event_type: event.type || "unknown",
          user_email: itemData?.userEmail || event.userEmail || event.user_email,
          user_id: userId,
          account_tier: event.account_tier,
          account_id: event.accountId || event.account_id,
          board_id: boardId,
          item_id: itemId,
          item_name: itemData?.itemName,
          board_name: itemData?.boardName,
          status: itemData?.status,
          raw_event: req.body,
          recipe_id: recipeId,
        });
        console.log("Webhook event saved:", savedEvent.id);
      } catch (dbError) {
        console.error("Error saving webhook event to database:", dbError);
        // Don't fail webhook if DB save fails
      }

    } catch (error) {
      console.error("Webhook processing error:", error.message, error.stack);
      // Log the error, but the 200 response has already been sent.
    }
  });
});


export default { editData };
