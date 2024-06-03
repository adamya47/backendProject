import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
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


export default router