import express from "express";
import catchAsync from "../utils/catchAsync.js";
import { sendTestEmail } from "../services/email.service.js";
import { renderTemplate } from "../services/template.service.js";

const router = express.Router();

// Sample data for test emails
const sampleData = {
  itemName: "Homepage Redesign",
  boardName: "Project Alpha",
  status: "Done",
  assignee: "John Doe",
  dueDate: "Dec 15, 2024",
  parentName: null,
  userName: "Admin User",
  updateTime: new Date().toLocaleString(),
  columnValues: []
};

// POST /api/v1/test-email
router.post("/", catchAsync(async (req, res) => {
  const { config, testEmail, sampleItemId } = req.body;

  if (!config || !testEmail) {
    return res.status(400).json({ 
      error: "Missing required fields: config and testEmail" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(testEmail)) {
    return res.status(400).json({ 
      error: "Invalid email address format" 
    });
  }

  // Render templates with sample data
  const renderedSubject = renderTemplate(
    config.subjectTemplate || "[Test] Item Update",
    sampleData
  );
  const renderedBody = renderTemplate(
    config.bodyTemplate || "This is a test email.",
    sampleData
  );

  // Send test email
  const result = await sendTestEmail({
    to: testEmail,
    subject: renderedSubject,
    body: renderedBody,
    fromName: config.fromName || "SmartNotify"
  });

  res.status(200).json({ 
    success: result.success !== false,
    message: result.success !== false ? "Test email sent successfully" : "Failed to send test email",
    recipient: testEmail,
    result: result
  });
}));

export default router;

