import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//steps to do to register user 
    //1.get user info (email,username,password,fullName) see user model to know that
    //2.validation-(idhr we will check if empty to nahi) can do more validations too
    //3.check if user already exist(will do with email and username) (can do with one only too)
    //4.check for images in local storage,check for avatar ,must cause (avatar required :true)
    //5.upload them to cloudinary,(we also have to check ki avatar uplaod hoa on cloudinary ya nahi cause its must in database toh needed hai)
    //6.create user object ,create entry in db (mongodb is a noSQL database (no structured query language database matlab table rows ni hoti traditional and more to know))
    //7.remove password and refresh token field from response (user create hone pe response bhi milta jisme as it as sab hota hai,hume usme se remove krna hai yeh sab cause hum yeh sab user/frontend pe ni dikhana chahte)
    //8.check for user creation
    //9.agr user created,return response



    /**Passwords and refresh tokens are sensitive pieces of information. If these are exposed, they could be misused by malicious actors to gain
      unauthorized access to user accounts or impersonate users. */


const registerUser=asyncHandler(async (req,res)=>{

    // 1.
      const {fullName,email,password,username}=req.body;

      
 //image files ke lia upload from multer used in router(concept in notes)







 //2. .some()It returns a boolean value: true if at least one element passes the test, and false otherwise.
  
  if(
    [fullName,email,password,username].some((field)=>
 field?.trim()===""                                 //check kr rha field hai?agr hai toh trim kr aur .aur ek bhi field empty aaya toh true return karenga
    )
){
    throw new ApiError(400,"Please fill all the fields")
  }



//3.      VVVIMMMP!!      //we used User yeh user model wala hai,  export const User=mongoose.model("User",userSchema);
                      //it helped to find the already existed user cause its already connected with mongoDb 


                 //findOne return the first user that it finds with same email or username
                  //we could've easily done findOne({email}) but we wanted ki email or username mein se ek bhi match kare toh vo wala user return kkrdo
                //so here findOne would return the first user that if alreaddy exists with same username or email 


 
                const existedUser= User.findOne({
                    $or:[{ email },{ username }]
                                    }) //$or Operator: This is a MongoDB logical operator that is used to perform a logical OR operation on an
                                       // array of one or more query expressions. 

if(existedUser){
 throw new ApiError("409","User with email or username already exist")
}


//4.
//req.files is a multer method for accessing files 

const avatarLocalPath=req.files?.avatar[0]?.path;

const coverImageLocalPath=req.files?.coverImage[0].path ;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is required")
}

//5 study the response that cloudinary gives after uplaoding from theory ,we would use url out of that 

const avatar=await uploadOnCloudinary(avatarLocalPath);
const coverImage=await uploadOnCloudinary(coverImageLocalPath)

//checking for avatar ki upload hogayi ya nahi
if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
}


//6 we know db se baat krne ke lia we can use User ,model wala 

const user=await User.create({
    fullName,
    email,
    password,
    username:username.toLowerCase(),
    avatar:avatar.url,//cloduinary response mein se bs url save krne ke lea lia 
    coverImage:coverImage?.url || "",//coverImage ke lia special checks because avatar ke boht check kia upr its confimed ki vo hoga hi hoga but
                                    // there is chaces ki coverImage ho hi na toh vo case bhi handle krna zaruri

})

//7. //we could do this directly on user too but the thing is that here we are able to do chaining with select function
const createdUser=await User.findById(user._id).select("-password -refreshToken") //already sab selected hote hai jsiko nahi krna vo likho in this syntax


//8
if(!createdUser){
    throw new ApiError(500,"Something went wrong while registering the user") //500 cause its server side issue
}

//9 
//seperately bhi .status isliye dia cause its a good practise ,even postman mei jo vo dikhata hai response ke sath status vo yahi expect krta hai,even if sirf Apiresponse mein bhi dete bs even thats not wrong too 
return res.status(201).json(
  //creating object of ApiResponse class 
    new ApiResponse(200,createdUser,"User Registered Successfully") //we could do .json({created user,status,}) but we have already defined structured response so thats why we are not doing that
)



})






export {registerUser}