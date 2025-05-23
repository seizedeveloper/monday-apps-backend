import axios from "axios";
import catchAsync from "../utils/catchAsync.js";
import { CLIENT_ID,CLIENT_SECRET } from "../utils/config.js";
const REDIRECT_URI = "http://localhost:3000/api/v1/auth/google-forms";  // Must match Monday Developer settings


// Step 1: Redirect user to Monday OAuth page
const authorizeApp = (req, res) => {
    console.log(CLIENT_ID,CLIENT_SECRET);
    const authUrl = `https://auth.monday.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    console.log("Redirecting to OAuth URL:", authUrl);
    res.redirect(authUrl);
};
// Step 2: Handle OAuth callback and fetch access token
const handleOAuthRedirect = catchAsync(async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).json({ error: "Authorization code not provided" });
    }

    try {
        const tokenResponse = await axios.post("https://auth.monday.com/oauth2/token", 
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
            }), 
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );

        console.log("Access Token Response:", tokenResponse.data);

        
        // You can store this token in a database if needed
        res.json({ message: "OAuth Successful", token: tokenResponse.data });

    } catch (error) {
        console.error("Error getting access token:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch access token" });
    }
});
const handleUserAuthentication = catchAsync(async (req, res) => {
    const { userId, password, email } = req.body;

    // Your normal authentication logic here
    res.status(200).send("User Authenticated");
});

export default { authorizeApp, handleOAuthRedirect, handleUserAuthentication };
