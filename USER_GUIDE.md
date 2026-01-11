# SmartNotify User Guide

## Getting Started

### Step 1: Install the App

[Marketplace link - Add your Monday.com app marketplace URL here]

### Step 2: Disable Native Notifications

**CRITICAL:** Prevent duplicate emails

1. Go to [Profile Icon] → Settings → Notifications
2. Uncheck: "Email me when an item I'm subscribed to is updated"
3. Uncheck any status-related notifications

### Step 3: Create Your First Recipe

1. Open any board → Automations
2. Click "Create Automation"
3. Search for "SmartNotify"
4. Choose trigger: "When status changes to [Done]"
5. Choose action: "Send custom email via SmartNotify"
6. Configure:
   - Subject: `[{board_name}] {item_name} - Complete`
   - Body: Your message with tokens
   - Recipient: Select column
7. Click Save

### Step 4: Test It

- Update an item's status to trigger
- Check recipient inbox

## Available Tokens

- `{item_name}` - Name of the task/item
- `{board_name}` - Board title
- `{status}` - Current status label
- `{assignee}` - Assigned person's name
- `{due_date}` - Due date value
- `{parent_name}` - Parent item name (for subitems)
- `{user_name}` - Name of user who triggered the update
- `{update_time}` - Time when the update occurred

## Troubleshooting

### I'm getting duplicate emails

→ You haven't disabled Monday's native notifications. See Step 2 above.

### Emails not sending

→ Check recipient column has valid email
→ Verify automation is active (not paused)
→ Ensure backend service is running and accessible
→ Check SendGrid daily limit (100 emails/day on free tier)

### Token showing as {item_name} in email

→ That item has no name. Monday returned empty value.

### Webhook errors

→ Verify webhook URL is correct in automation settings
→ Check that backend service is deployed and running
→ Ensure Monday.com signing secret matches backend configuration

