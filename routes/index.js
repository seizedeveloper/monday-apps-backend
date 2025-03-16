import webhookRouter from "./webhook.route.js"
import authRouter from "./auth.route.js"
import express from "express";

const router = express.Router();

console.log("Auth Routes Registered:", authRouter.stack.map(r => r.route?.path));
router.use("/auth",authRouter);
router.use("/webhook", webhookRouter);


export default router;