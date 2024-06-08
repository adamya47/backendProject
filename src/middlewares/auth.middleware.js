import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"


                                   //res not used we can replace it by _
export const verifyJWT= asyncHandler(async(req,_,next)=>{

try {
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") //cause mobile app se bhi aa sakti cookie ,and in that header se aati with key Authorization : Bearer <token>  to directy access token we did that .replace here to remove "Bearer " part
    
    if(!token){
        throw new ApiError(401,"Unauthorized request")
    }
     
             //import jwt for this 
    const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET) //if verified it returns decoded token jisme we have all the info that we gave while generation token  like _id,etc..se from code in user.model.js
    
    const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
    if (!user) {
                
        throw new ApiError(401, "Invalid Access Token")
    }
    req.user=user;//we added user here ab isko hum use kr paega in logout function ya aur kahin bhi jahan pe yeh middleware use hoga
    next();
    
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid Access Token")
    
}

})