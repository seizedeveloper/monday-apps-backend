import { webhookService } from "../services/index.js"
import catchAsync from "../utils/catchAsync.js"
import { response } from "express";
import jwt from "jsonwebtoken";

const editData = catchAsync(async (req, res) => {
  try {
      // Log everything to see what Monday is sending
      console.log("Received Webhook Headers:", req.headers);
      console.log("Received Webhook Body:", req.body);

      // Extract token from request body
      const token = req.headers.authorization;  

      if (!token) {
          return res.status(401).json({ error: "No token provided" });
      }

      console.log("Received Token:", token); 

      const event = req.body;
      let response; 

      if (event.type === "install") {
          response = { success: true, message: "App Installed", data: event.data };
          console.log("App Installed:", event.data);
      } else if (event.type === "uninstall") {
          response = await webhookService.deleteData(token, "24029607");
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

export default { editData };
