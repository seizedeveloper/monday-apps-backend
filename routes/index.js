import webhookRouter from "./webhook.route.js"
import authRouter from "./auth.route.js"

import express from "express";

const router = express.Router();

router.use("/auth",authRouter);
router.use("/webhook", webhookRouter);


export default router;