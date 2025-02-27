import { authService } from "../services/index.js"
import catchAsync from "../utils/catchAsync.js"

const handleUserAuthentication = catchAsync(async(req,res) => {
    const {userId, password, email} =req.body;
    
    res.status(200).send("User Authenticated");
    
});


export default {handleUserAuthentication};