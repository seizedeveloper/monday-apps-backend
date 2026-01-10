// index.js
import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import mondaySdk from "monday-sdk-js";
import routes from "./routes/index.js";
import { PORT } from "./utils/config.js";
import mongoose from "mongoose";
import connectDB from "./utils/connection.js"; // assume this exports a function

const app = express();
const monday = mondaySdk();
monday.setApiVersion("2023-10");

// Capture raw body for signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ CTS: "Up and Running" });
});

app.use('/api/v1', routes);

// Connect to DB and start server
// Start server even if DB connection fails (for testing without MongoDB)
connectDB().then(() => {
  console.log("MongoDB connected successfully");
  startServer();
}).catch(err => {
  console.warn("DB connection failed (continuing without DB):", err.message);
  console.warn("Webhook events will not be saved to database, but email functionality will work");
  startServer();
});

function startServer() {
  app.listen(PORT || 3000, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Test email endpoint: http://localhost:${PORT}/api/v1/test-email`);
    console.log(`Template API endpoint: http://localhost:${PORT}/api/v1/templates/:boardId`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/api/v1/webhook`);
  });
}

export default app;
