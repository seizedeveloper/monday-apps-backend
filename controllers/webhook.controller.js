import { webhookService } from "../services/index.js"
import {google_forms_secret} from "../utils/config.js"
import catchAsync from "../utils/catchAsync.js"
import { response } from "express";

const editData=  catchAsync(async (req, res) => {



    try {
        const authHeader = req.headers.authorization;
    
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "No token provided" });
        }
    
        // Extract the token (remove "Bearer " prefix)
        const token = authHeader.split(" ")[1];
    
        // Verify and decode the token
        const decoded = jwt.verify(token, google_forms_secret); 
    
        console.log("Decoded JWT:", decoded);


        const event = req.body;

        console.log("Received webhook event:", event);
        let response; 

        if (event.type === "install") {
            response = { success: true, message: "App Installed", data: event.data };
            console.log("App Installed:", event.data);
        } else if (event.type === "uninstall") {
            response = await webhookService.deleteData(token);
            console.log("App Uninstalled:", event.data);
            // Handle app uninstallation
        } else {
            response = { success: false, message: "Unhandled event type", eventType: event.type };
            console.log("Unhandled event type:", event.type);
        }
        
        res.status(200).json(response); // Use the final response here
        
      } catch (error) {
        res.status(401).json({ error: "Invalid token" });
      }
    
    
  });

  export default {editData};