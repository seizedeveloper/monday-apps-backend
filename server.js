import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import mondaySdk from "monday-sdk-js";
import routes from "./routes/index.js"; // Ensure the correct path with .js extension
import { PORT } from "./utils/config.js";


const app = express();


const monday = mondaySdk();
monday.setApiVersion("2023-10");

// Middleware to parse JSON
app.use(bodyParser.json());

// Your monday.com webhook secret (replace with your actual secret)

// Function to verify JWT token from monday.com
// app.use("/oauth2",authRoute);
app.get("/",(req,res)=>{
    res.status(200).json({CTS: "Up and Running"});
  })

app.use('/api/v1',routes);  
// const verifyWebhook = (req, res, next) => {
//     try {
//         const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Authorization" header
//         if (!token) {
//             return res.status(403).json({ error: "Unauthorized: No token provided" });
//         }

//         // Verify JWT signature
//         jwt.verify(token, MONDAY_SIGNING_SECRET, (err, decoded) => {
//             if (err) {
//                 return res.status(403).json({ error: "Unauthorized: Invalid token" });
//             }
//             req.mondayData = decoded;
//             next();
//         });
//     } catch (error) {
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// Webhook endpoint
// app.post("/webhook", (req, res) => {
//     const event = req.body;

//     console.log("Received webhook event:", event);

//     switch (event.type) {
//         case "install":
//             console.log("App Installed:", event.data);
//             // Handle app installation (e.g., store user details in DB)
//             break;
//         case "uninstall":
//             console.log("App Uninstalled:", event.data);
//             monday.storage.instance.deleteItem('url').then(res => {
//                 const value = res.data?.value;
//                 console.log(value);
//                 console.log("User data deleted");
//                  // Provide a default value if undefined
//               });
//             // Handle app uninstallation (e.g., remove user data)
//             break;
//         case "subscription":
//             console.log("Subscription Event:", event.data);
//             // Handle subscription changes
//             break;
//         default:
//             console.log("Unhandled event type:", event.type);
//     }

//     // Respond to monday.com to acknowledge receipt
//     res.status(200).send("Webhook received");
// });

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;