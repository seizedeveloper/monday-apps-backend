# SmartNotify Backend

SmartNotify is a custom email notification service for Monday.com that sends personalized emails when board items are updated, using webhooks and SendGrid for delivery.

## Tech Stack

- **Node.js** with Express.js
- **SendGrid** for email delivery
- **MongoDB** (optional) for webhook event logging
- **Monday.com API** for fetching item data
- **Bottleneck** for rate limiting

## Installation Steps for Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd monday-apps-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.template` to `.env`
   - Fill in all required values (see Environment Variables section)

4. **Run locally**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FROM_EMAIL=your-verified-email@domain.com
SENDGRID_FREE_MODE=true
SENDGRID_FREE_DAILY_LIMIT=100

# Monday.com Configuration
MONDAY_API_TOKEN=your_monday_api_token
MONDAY_SIGNING_SECRET=your_signing_secret

# MongoDB (Optional - for webhook event logging)
MONGODB_URI=mongodb://localhost:27017/smartnotify
```

### Getting Your Credentials

- **SendGrid API Key**: Sign up at [SendGrid](https://sendgrid.com), verify your sender email, and create an API key
- **Monday.com API Token**: Go to Monday.com → Profile → API → Generate token
- **Monday.com Signing Secret**: Found in your Monday.com app settings

## How to Run Locally

```bash
npm run dev
```

The server will be available at:
- Health check: `http://localhost:3000/`
- Test email: `http://localhost:3000/api/v1/test-email`
- Templates API: `http://localhost:3000/api/v1/templates/:boardId`
- Webhook endpoint: `http://localhost:3000/api/v1/webhook`

## Deployment Steps

### Deploy to Heroku

1. **Install Heroku CLI** (if not already installed)
   ```bash
   npm install -g heroku-cli
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku app** (if not exists)
   ```bash
   heroku create monday-apps-backend
   ```

4. **Set environment variables in Heroku**
   ```bash
   heroku config:set SENDGRID_API_KEY=SG.xxxxx
   heroku config:set FROM_EMAIL=your-email@domain.com
   heroku config:set MONDAY_API_TOKEN=your_token
   heroku config:set MONDAY_SIGNING_SECRET=your_secret
   heroku config:set SENDGRID_FREE_MODE=true
   heroku config:set SENDGRID_FREE_DAILY_LIMIT=100
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

6. **Verify deployment**
   ```bash
   heroku open
   ```

### Deploy to Other Platforms

For other platforms (AWS, DigitalOcean, etc.), follow their deployment guides and ensure:
- All environment variables are set
- The server listens on the port provided by the platform (usually via `process.env.PORT`)
- CORS is enabled for Monday.com domains

## API Endpoints

### POST `/api/v1/test-email`
Send a test email with sample data.

**Request Body:**
```json
{
  "testEmail": "recipient@example.com",
  "config": {
    "subjectTemplate": "Test Email",
    "bodyTemplate": "This is a test",
    "fromName": "SmartNotify"
  }
}
```

### POST `/api/v1/templates/:boardId`
Save a template configuration for a board.

### GET `/api/v1/templates/:boardId`
Retrieve template configuration for a board.

### DELETE `/api/v1/templates/:boardId`
Delete template configuration for a board.

### POST `/api/v1/webhook`
Monday.com webhook endpoint (called automatically by Monday.com automations).

## Troubleshooting

### Emails not sending
- Verify SendGrid API key is correct
- Check that `FROM_EMAIL` is verified in SendGrid
- Ensure SendGrid free tier daily limit hasn't been exceeded

### Webhook not receiving events
- Verify `MONDAY_SIGNING_SECRET` matches your Monday.com app settings
- Check that webhook URL is correctly configured in Monday.com automation
- Ensure CORS is enabled for Monday.com domains

### Rate limiting errors
- The backend limits to 5 concurrent requests to Monday.com API
- SendGrid free tier allows 100 emails/day
- Check logs for specific error messages
