import { Router } from "express";
import { loginUser, logoutUser, registerUser,
  refreshAccessToken, changeCurrentPassword,
   getCurrentUser, updateAccountDetails, updateUserAvatar,
    getUserChannelProfile, getWatchHistory, 
    updateUserCoverImage} from "../controllers/user.controllers.js";
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

router.route("/change-password").post(verifyJWT,changeCurrentPassword) //change password is usually sent as .post() isme more that just replacing a field,we have to hash passoword,.post() used in changing password as it signifies creating new state or updating a crucial aspect (the password) of the user's credentials, which involves more than just a partial update.

router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails) //patch cause partial changes not full change

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar) //first middle used is verifyJWT cause pehle verify krna zaruri than upload by multer middleware
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

//param  case
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router