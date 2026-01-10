import express from "express";
import catchAsync from "../utils/catchAsync.js";
import { getTemplateStorage } from "../controllers/webhook.controller.js";

const router = express.Router();

// Save template (called from frontend)
router.post("/:boardId", catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const template = req.body;
  const templateStorage = getTemplateStorage();
  
  if (!template.recipeId && !template.id) {
    return res.status(400).json({ error: "Template ID or recipeId is required" });
  }
  
  if (!template.subjectTemplate || !template.bodyTemplate) {
    return res.status(400).json({ error: "Subject and body templates are required" });
  }
  
  // Use recipeId as template ID if provided
  const templateId = template.recipeId || template.id;
  
  // Store template by board ID
  if (!templateStorage.has(boardId)) {
    templateStorage.set(boardId, new Map());
  }
  templateStorage.get(boardId).set(templateId, {
    ...template,
    id: templateId
  });
  
  res.status(200).json({ success: true, message: "Template saved" });
}));

// Get template for board (used by webhook processing)
router.get("/:boardId", catchAsync(async (req, res) => {
  const { boardId } = req.params;
  const { templateId } = req.query;
  const templateStorage = getTemplateStorage();
  
  if (!templateStorage.has(boardId)) {
    return res.status(404).json({ error: "No templates found for this board" });
  }
  
  const boardTemplates = templateStorage.get(boardId);
  
  if (templateId) {
    // Return specific template
    const template = boardTemplates.get(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    return res.status(200).json(template);
  } else {
    // Return all templates for board
    const templates = Array.from(boardTemplates.values());
    return res.status(200).json(templates);
  }
}));

// Delete template
router.delete("/:boardId/:templateId", catchAsync(async (req, res) => {
  const { boardId, templateId } = req.params;
  const templateStorage = getTemplateStorage();
  
  if (!templateStorage.has(boardId)) {
    return res.status(404).json({ error: "Board not found" });
  }
  
  const boardTemplates = templateStorage.get(boardId);
  if (!boardTemplates.has(templateId)) {
    return res.status(404).json({ error: "Template not found" });
  }
  
  boardTemplates.delete(templateId);
  res.status(200).json({ success: true, message: "Template deleted" });
}));

export default router;

