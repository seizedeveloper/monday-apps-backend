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

app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ CTS: "Up and Running" });
});

app.use('/api/v1', routes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT || 3000, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("DB connection failed:", err);
});

export default app;
