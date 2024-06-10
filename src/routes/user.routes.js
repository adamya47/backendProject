import { Router } from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

// Use upload.fields() when you expect multiple files from different fields in the form. Each field can have a different name and a different
// maximum number of files.
// Use upload.array() when you expect multiple files from a single field in the form.

router.route("/register").post(
  
    upload.fields([
    {name:"avatar", //front end mein bhi field ka name yahi rakhenge jo idhr rakha hai 
     maxCount:1
    },{
  name:"coverImage",
  maxCount:1
    }
])                     
    ,registerUser)
    /**
 router.route("/register").post(registerUser)
 post(handler): This specifies that the handler function registerUser should be called when a POST request is made to the /register route.
registerUser: This is the handler function that will be executed when a POST request is received at /register.
 */

router.route("/login").post(loginUser)


//Secured routes ,(which require the user to be authorized before entering)//here authorization done by verifyJWT from custom auth.middleware.js

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)//we didnt used verifyJWT custom middleware here cause idhr humne in refreshAccesstoken mein uska kaam khud hi kr dia hai (cookie se token lena fir verify aur user access everything)






export default router