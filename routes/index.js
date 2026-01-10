import webhookRouter from "./webhook.route.js"
import authRouter from "./auth.route.js"
import templatesRouter from "./templates.route.js";
import testEmailRouter from "./testEmail.route.js";

import express from "express";

const router = express.Router();

router.use("/auth",authRouter);
router.use("/webhook", webhookRouter);
router.use("/templates", templatesRouter);
router.use("/test-email", testEmailRouter);


export default router;