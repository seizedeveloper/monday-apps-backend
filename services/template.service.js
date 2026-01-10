// Template rendering with token replacement
export const renderTemplate = (template, itemData) => {
  if (!template || typeof template !== "string") {
    return "";
  }
  
  if (!itemData) {
    console.warn("No item data provided for template rendering");
    return template;
  }
  
  // Token mapping
  const tokenMap = {
    "{item_name}": itemData.itemName || "Untitled Item",
    "{board_name}": itemData.boardName || "Unknown Board",
    "{status}": itemData.status || "",
    "{assignee}": itemData.assignee || "Unassigned",
    "{due_date}": itemData.dueDate || "No due date",
    "{parent_name}": itemData.parentName || itemData.boardName || "Unknown Board",
    "{user_name}": itemData.userName || "Unknown User",
    "{update_time}": itemData.updateTime || new Date().toLocaleString()
  };
  
  // Start with template string
  let rendered = template;
  
  // Replace each token
  Object.keys(tokenMap).forEach(token => {
    const value = tokenMap[token] || "";
    // Use global replace to replace all occurrences
    rendered = rendered.replace(new RegExp(token.replace(/[{}]/g, "\\$&"), "g"), value);
  });
  
  // Handle any remaining tokens (graceful fallback)
  const remainingTokens = rendered.match(/\{[^}]+\}/g);
  if (remainingTokens) {
    remainingTokens.forEach(token => {
      rendered = rendered.replace(token, "");
      console.warn(`Unknown token in template: ${token}`);
    });
  }
  
  return rendered;
};

