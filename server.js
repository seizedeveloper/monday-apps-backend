import express from "express";
import jwt from "jsonwebtoken";
import bodyParser from "body-parser";
import mondaySdk from "monday-sdk-js";
import routes from "./routes/index.js"; // Ensure the correct path with .js extension
import { PORT } from "./utils/config.js";


const app = express();
app.use(express.json()); 

const monday = mondaySdk();
monday.setApiVersion("2023-10");

// Middleware to parse JSON
app.use(bodyParser.json());

// app.use("/oauth2",authRoute);
app.get("/",(req,res)=>{
    res.status(200).json({CTS: "Up and Running"});
  })

app.use('/api/v1',routes);  

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;