import { webhookService } from "../services/index.js"
import {google_forms_secret} from "../utils/config.js"
import catchAsync from "../utils/catchAsync.js"
import { response } from "express";
import jwt from "jsonwebtoken";
import mondaySdk from 'monday-sdk-js';


const editData = catchAsync(async (req, res) => {
  try {
    const monday = mondaySdk();
    monday.setApiVersion("2023-10");
    
      // Log everything to see what Monday is sending
      console.log("Received Webhook Headers:", req.headers);
      console.log("Received Webhook Body:", req.body);

      // Extract token from request body
      const token = req.headers.authorization;  

      if (!token) {
          return res.status(401).json({ error: "No token provided" });
      }

      console.log("Received Token:", token); 
      if (!req.body || !req.body.data) {
        throw new Error("Invalid webhook structure");
      }
  
    //   console.log(req.body);
      monday.setToken(token);
      const event = req.body;
      let response; 

      if (!req.body || !req.body.data) {
        return res.status(400).json({ error: "Invalid webhook structure" });
    }
    
    const { app_id, user_id, account_id } = req.body.data || {};
    if (!app_id || !account_id || !user_id) {
        return res.status(400).json({ error: "Missing required fields (app_id, user_id, account_id)" });
    }
    

      if (event.type === "install") {
          response = { success: true, message: "App Installed", data: event.data };
          console.log("App Installed:", event.data);
      } else if (event.type === "uninstall") {
        console.log("appid and accountid are:",app_id,account_id);
          response = await webhookService.deleteData(app_id,account_id);
          console.log("App Uninstalled:", event.data);
      } else {
          response = { success: false, message: "Unhandled event type", eventType: event.type };
          console.log("Unhandled event type:", event.type);
      }
      
      res.status(200).json(response);
  } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: error.message });
  }
});

export default { editData };
