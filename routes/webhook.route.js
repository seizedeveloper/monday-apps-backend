import express from "express";
import {webhookController} from "../controllers/index.js";

const webhookRouter = express.Router();

webhookRouter.post('/',webhookController.editData);


export default webhookRouter;
