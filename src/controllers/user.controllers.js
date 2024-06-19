import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose, { Mongoose } from "mongoose";


//making a seperate function for generating access and refresh token because yeh boht baar use hoga ,and we dont want to repeat things again and again
const generateAccessAndRefreshToken=async(userId)=>{
  try {

const user=await User.findById(userId);
const accessToken=user.generateAccessToken();
const refreshToken=user.generateRefreshToken();

//user object ke andr dalre 
user.refreshToken=refreshToken //refresh token saved but access token is not(whole explanation at bottom )

//ab saving it in db 
await user.save({ validateBeforeSave: false })//cause normally save kare toh vo model mein required cheezen like password rmail etc dobara mangega aur hum abhi vo sab nahi dena chahte isliye validtion false krdi

return {accessToken,refreshToken}

    
  } 
  catch (error) {
    
    
    throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}




const registerUser=asyncHandler(async (req,res)=>{

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

    // 1.
      const {fullName,email,password,username}=req.body;//req.body se images/files nhi milti

 //image files ke lia upload from multer used in router(concept in notes)







 // 2.  .some() It returns a boolean value: true if at least one element passes the test, and false otherwise.
  
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


 
                const existedUser=await User.findOne({ //"await cause db is in another continent" 
                    $or:[{ email },{ username }]
                                    }) //$or Operator: This is a MongoDB logical operator that is used to perform a logical OR operation on an
                                       // array of one or more query expressions. 

if(existedUser){
 throw new ApiError("409","User with email or username already exist")
}


//4.
//req.files is a multer method for accessing files 
                                     
 
const avatarLocalPath=req.files?.avatar?.[0]?.path; //avatar?.[0] vvimp step 
                                                    //cause if we did only avatar[0]?. and then if we didnt send avatar file if would give 
                                                    //"Cannot read properties of undefined" cause avatar array hota hi nahi toh avatar[0] kaise hoga so make a 
                                                    //check of avatar? before doing avatar[0]

const coverImageLocalPath=req.files?.coverImage?.[0].path ;


//traditional way to do that we are not opting it cause we fixed it with chaining but its good to know 

// let coverImageLocalPath
// console.log(coverImageLocalPath)
// if(Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 ){
//   coverImageLocalPath=req.files.coverImage[0].path
// }


if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is required")
}

//5 study the response that cloudinary gives after uplaoding from theory ,we would use url out of that 

const avatar=await uploadOnCloudinary(avatarLocalPath);
const coverImage=await uploadOnCloudinary(coverImageLocalPath);





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


const loginUser=asyncHandler(async (req,res)=>{

  //1.req body
  //2.username or email
  //3.find the user and check if you found it
  //4.check password
  //5.access and refresh token 
  //6.send cookie(tokens send by cookies ,we send secure cookies)


 //1.
  const{email,username,password}=req.body;

  //2.
 if(!(username || email)){        //we checking ki email ya username mein se ek ho bs agr dono ni honnge to it will be if(!false)=>if(true) aur error throw kr dega
  throw new ApiError(400,"username or email is required")
 }

 //3.
 //this will return the first/oneTh user which it finds with matching email or username
 const user=await User.findOne({
  $or:[{username},{email}]
 })

 
 if(!user){
  throw new ApiError(404,"User does not exist");
 }

 //4

 const isPasswordValid= await user.isPasswordCorrect(password)//we use User for mongoDb methods like findone,updateone and user for own created methods like isPasswordCorrect,generate access token

if(!isPasswordValid){
  throw new ApiError(401,"Please enter the correct password")
}

//5//tokens cookies mein bhej denge
const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id) //MIND CONCEPT-dekh yeh iss function mein await vagera use hore toh time lag sakta hai ab to make sure ki yeh time pe  ho aur fir hi aage jae isliye use await 

//see ab #3 wale user ke refernece mein unwanted cheezen like password hai 
//aur refresh token nahi hai uss wale refernece mein refrenceToken empty hai  ,though  db mein stored hai but 'user' wale refrence mein nahi hai cause vo refrence humne pehle lia tha generateaAccessAndRefresh wale function call krne se pehle
//now we got two options to cater this issue 1.user mein hi update krdo by user.refreshToken(yeh less expensive )
//2. naya reference  of User le aao from database ,usme refreshToken hoga cause abhi db mein refresh token hai toh hum naya refernce lenge toh usme bhi hoga
//2nd one is more expensive toh ab vo tumpe depend krta ki kya afford krsakte ho ya nahi,vo khud dekh lena

//ALLL CLARITY KEH SATH(AIM AND ISSUE)
//AIM -We doing this step to remove things like passoword and refrenceToken. from Our user ref that we will return
//DOUBT CLEARNING STEP--- yeh referneceToken hume bhejna nahi THEEK HAI.aur #3 wale mein hai bhi nahi 
//but hum passowrd remove krna chate toh uske lia we made call for another user ref but when we made this call toh usme refreshToken hoga.YES isme hoga refresh token aur #3 wale mein nahi tha, so usko hata dia from call 
//we could easily remove passowrd from #3 user too by delete user.passoword. but chalo select() use krna seekh lia

const loggedInUser=await User.findById(user._id).select("-password -refreshToken");//though humne refresh token remove hi kr dia here, toh kuch point ni ,still we learned concept here value that
//hum return karenge yeh as a resposne aur hum nahi chahte  password aur refreshToken dena here 



//6 COOKIES 
//for cookies we have to configure options too

const options={//by default cookies are modifiable at both front and backend ,but after this the are modifyable only at backend ,and frontend pe can be seen only 
  httpOnly:true,//When this option is set to true, the cookie is only accessible via HTTP(S) requests and is not accessible via JavaScript running in the browser,prevents from XSS attacks
  secure:true   //cookie is only sent over secure HTTPS connections, protecting it from being intercepted(access) during transmission. This helps prevent man-in-the-middle attacks.
}
                          //.cookie(key,value,option)
return res.status(200).cookie("accessToken",accessToken,options) 
          .cookie("refreshToken",refreshToken,options)
          .json(
            new ApiResponse(
              200,
              {
              user:loggedInUser,
              accessToken,
              refreshToken
              },
             "User Logged in Successfully"

              //we returned tokens both in through cookies and json and both serve differenct purpose
            /*
            1.THROUGH COOKIES 
            Automatic Handling: Browsers automatically handle cookies, sending them with each HTTP request to the domain that set them. This means that you don't need to manually include the tokens in the headers of every request.
Secure Storage: By using options like httpOnly and secure, cookies can be securely stored and protected from client-side scripts, enhancing security.
             
2.THROUGH JSON
Flexibility for Different Clients:

Mobile Apps: Cookies are browser-specific,While cookies are commonly used for web applications, they are not as applicable to native mobile apps 
Mobile applications or single-page applications (SPAs) might prefer to store tokens in memory or local storage rather than cookies. Returning tokens in JSON allows these clients to handle them in a way that best suits their needs.
Custom Storage: Some applications may have custom storage requirements or strategies that are better handled with tokens stored outside of cookies.
             
Conclusion
Returning tokens both in cookies and in the JSON response ensures that you cover a wide range of client requirements and use cases, providing a 
flexible, secure, and user-friendly authentication mechanism. This dual approach helps in creating a more robust and versatile system that can 
accommodate various client implementations.
             */

            )
          )
           
          




})
//logout concepts and thinking all explained in notes MUST VISIT ,DONT PROCEED WITHOUT UNDERSTANDING THAT
const logoutUser=asyncHandler(async(req,res)=>{

         //we used findbyidandUpdate here so that seperately pehle reference lo user ki ,fir usme refresh token remove karo ,fir save karo aur save me validateBeforeSave wala false karo ,uss sab se ache seedha yeh use kar lo
  await User.findByIdAndUpdate(req.user._id,{

         $unset:{
                  refreshToken:1 //this will remove the field from document ,we can also do {refreshToken: ""} //same effect
           }                      // we want to add field we can use $set
                                      },
  
  {
    new:true   //what this does is ,if it is true it will return updated document rather than the old document
  }

)

const options={
  httpOnly:true,
  secure:true
}

return res
.status(200)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,{},"User Logged out Successfully"))


})


//study all the concepts in notes must,study full story #16 (must)
//iska end point bhi banaya hai route mein
//though our main gold here is we  are saying that refresh the access token but at the end isme hum dono tokens hi refresh kr dete hain dobara generate krke
const refreshAccessToken=asyncHandler(async(req,res)=>{
 
const incomingRefeshToken=req.cookies.refreshToken || req.body.refreshToken //(using req.body for app case) ,can also use header too ,uska alag scene ,leave it for now

if(!incomingRefeshToken){
  throw new ApiError(401,"unauthorized request")
}
try {

  const decodedToken= jwt.verify(incomingRefeshToken,process.env.REFRESH_TOKEN_SECRET);


  // if(!decodedToken){  //no needed to do this cause jwt will throw error if any issue
  //   throw new ApiError(401,"Refresh Token unverified")
  // }

  const user=await User.findById(decodedToken._id)

  if(!user){
    throw new ApiError(401,"Invalid Refresh Token")
  }
 
  //till now its cleared that incoming refreshToken is valid ,now we have to check that incoming refresh token is same as that in db

 if(incomingRefeshToken !== user?.refreshToken){
  throw new ApiError(401,"Refresh token is expired or used")
 }

 //ab yeh done ki ,refresh token is correct now generate new access and refresh token

const{accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)

user.refreshToken=refreshToken;

await user.save({validateBeforeSave:false})

const options={
  httpOnly:true,
  secure:true
}
return res.status(200).cookie("accessToken",accessToken,options)
         .cookie("refreshToken",refreshToken,options)
         .json(
          new ApiResponse(200,
            {accessToken,
            refreshToken}
            ,
            "Access token refreshed"
          )
         )

} catch (error) {
  throw new ApiError(401,error?.message || "Invalid refresh token")
}




})


// #17 writing some update controllers for user

const changeCurrentPassword=asyncHandler(async(req,res)=>{

const{oldPassword,newPassword}=req.body;

//concept here we will use our auth middleware toh req.user hoga humare pass for user access

const user=await User.findById(req.user?._id)

//we are using our own created method to check if entered password match with the password in db
const isPassowordCorrect=await user.isPassowordCorrect(oldPassword)//this will return true or false

//we didnt do if(oldPassword !== user.password)to check  cause user.password is stored in hashed form using bcrypt aur entered passowrd is not,toh iss tareeka se vo match hi nahi honge kabhi


if(!isPassowordCorrect){
  throw new ApiError(400,"Invalid old password")
}

user.password=newPassword;
await user.save({validateBeforeSave:false})//save hone se pehle pre("save") wala middleware bhi call hoga that we wrote in user.model.js ,it will store the new password in hashed form in db

return res.status(200).json(new ApiResponse(200,{},"Password Changed successfully"))


})

const getCurrentUser=asyncHandler(async(req,res)=>{

  //seedha middleware daal denge jisse req.user mil jaega aur fir vahi toh hai humare current user ,ussi kor return kr denge

  return res
  .status(200)
  .json(new ApiResponse(
     
    200,req.user,"User fetched successfully"
  
  ))


})


//PRO TIP- try to makes seperate controllers for updating files,its more convinent and production level thing 


const updateAccountDetails=asyncHandler(async(req,res)=>{

const {fullName,email}=req.body //its upto  you what you want to allow user to change ,no fixed rule

if(!fullName || !email){
  throw new ApiError(400,"All fields are required")
}

const  user=await User.findByIdAndUpdate(
  req.body._id,
   
  {
    $set:{
      fullName:fullName,
      email
    }
  },
  
  {new:true}//this will return updated 



).select("-password")

return res.status(200).json(
  new ApiResponse(200,user,"Account details updated successfully")
)


});




//now writing controllers for updating files 

//two middleware will be used here ,
//1. multer because ussi se hi  new file upload hogi aur uska  access milega (req.file) 
//2. auth cause only authorized users can do this 

const updateUserAvatar=asyncHandler(async(req,res)=>{

const avatarLocalPath=req.file?.path; // we didnt do req.files like we did while registering because usme we expected multiple files ,here we expect one file only

if(!avatarLocalPath){
  throw new ApiError(400,"Avatar file is missing")
}
//TODO: delete old image from cloudinary assignment 

const avatar=await uploadOnCloudinary(avatarLocalPath)

if(!avatar.url){
  throw new ApiError(400,"Error while uploading on avatar")
}

//cause we are using auth middleware too we get access of req.user

const user=await User.findByIdAndUpdate(
  req.user?._id,

  {
    $set:{
      avatar:avatar.url
    }
  },

  {
    new:true
  }
).select("-password")



return res.status(200).json(
  new ApiResponse(200,user,"Avatar Image updated successfully")
)

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{

  const coverImageLocalPath=req.file?.path; 
  
  if(!coverImageLocalPath){
    throw new ApiError(400,"Cover Image file is missing")
  }
  //TODO DELETE OLD IMAGE
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  
  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading on Cover Image")
  }
  
  
  
  const user=await User.findByIdAndUpdate(
    req.user?._id,
  
    {
      $set:{
        coverImage:coverImage.url
      }
    },
  
    {
      new:true
    }
  ).select("-password")
  
  
  
  return res.status(200)
  .json(
    new ApiResponse(200,user,"Cover Image updated successfully")
  )
  
  })
  

  const getUserChannelProfile=asyncHandler(async(req,res)=>{
 //GOAL -When we visit a user profile like in youtube ,we are able to see his/her Subscribers and channels subscribed by him,
 //his usernam ,email,profile,coverImage //we have to return all this here 
//major concepts and learning is in obtaining subscribers count and no of channels he/she is subscribed too

//ALSO WHETHER WE ARE SUBSCRIBED TO THE PROFILE OR NOT USKE LIA BHI EK INDICATOR TRUE FALSE DENA ZARURI


const {username}=req.params

if(!username){
  throw new ApiError(400,"username is missing")
}
               //await cause db call and "db is in another continent"

const channel= await User.aggregate( [


{
  $match:{username:username}//all documents will get filtered and we will get one document from this that will have the same username as obtained from url param ,all the remaing will documents will be filtered out here 
}
,
{
//from this we will obtain a field called subscribers which will be an array of objects,objects are documents of all the subsrcibers of the user profile we visited ,the document will be of Subscription model (it would contain channel,subscriber field)

  $lookup:{
    from:"subscriptions",//cause we know mongo db lower case and plural mein save krta toh "Subscription" model ko usne "subscriptions" krdia
    localField:"_id",
    foreignField:"channel",
    as:"subscribers"
  }

},{
  //from this we will obtain a field called subscribedTo which will be an array of objects,objects are documents of all the channels THE userProfile that we visited is subscribed to


$lookup:{
  from:"subscriptions",
  localField:"_id",
  foreignField:"subscriber",
  as:"subscribedTo"


}

},
//documents to mil gayi but we want number toh uske lia we do this
//also a indictor for whether the profile we visied ,are we subscribed to it or not

{

  $addFields:{

    subcribersCount:{
      $size:"$subscribers" //it will calculate the size of of array and it is equal to subscriber count
    },
    channelsSubscribedToCount:{
      $size:"$subscribedTo"
    }
    ,
    isSubscribed :{

      $cond:{   
                //req.user cause authorized honge toh we have access to it 
        if:{$in:[req.user?._id,"$subscribers.subscriber"]},// VVIMP : what $in does here is it checks ,if humari id match hori with any document ,NOT JUST MATCH HORI BUT IF  humari _id match hori with the subscriber key of subscribers field in any document,jisse hume yeh pta chale ki hum subscribed hai ya nahi to the profile we are visiting to  (//thought- subscribers field is containg document having Subscription model toh usme channel aur subscriber key toh hongi) 

        then:true,

        else:false
      }

    }


  }
}
  ,
  
  {

    $project:{
      //study project concepts from notes

   fullName :1,
   email:1,
   username:1,
   avatar:1,
   coverImage:1,
   subcribersCount:1,
   channelsSubscribedToCount:1,
   isSubscribed :1


    }
  
    //_id by default included hi rehti hai toh not needed 
//now aggregate method at last return an array of objects containg objects of all the documents
//here humane pass ek hi object hoga cause ek hi document hogi of the profile we visited

}


])

if(!channel?.length){
  throw new ApiError(400,"Channel does not exists")
}


return res.status(200).json(
  new ApiResponse(200,
    channel[0], //cause aggregate will return array of objects aur humare is case mein toh ek hi hoga cause sirf channel ki profile wala document only
    "User channel fetched successfully"
  )
)





  })


const getWatchHistory=asyncHandler(async(req,res)=>{

  const user=await User.aggregate([

//stage 1
{

$match:{
  _id: new mongoose.Types.ObjectId(req.user._id)

}//see isme we obtained single document of user with match id

},

//stage 2

{ //ab us single document ki watchhistory pe karre kaam

  $lookup:{
    from:"videos",
    localField:"watchHistory",
    foreignField:"_id",
    as:"watchHistory",//now adding subpipeline to add owner info
    //ab we obtained all documents of videos in watchHistory but uss doument me no owner info ,to do that "FOR EACH" video document that in each video document there should be owner info we wirte sub-pipeline
   pipeline:[



    {

      $lookup:{//abhi local is video and foreign is user
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"owner",//we obtained all the info about owner from user model 


        //we dont want to give include all owner info (matab owner jo user bhi hai uski info ki baat) , we just want few things ,for that isme hi sub-pipeline ek aur alga di
        pipeline:[ //**  
          {
            $project:{
              fullName:1,
              username:1,
              avatar:1
            }
          }
        ]
      }
    }

    // , YEH project wala  scene agr yahan lagate matbab bahar wali sub pipeline wale array mein toh bhi hota ya nahi check try krke
  ,{
    //doing this so that hame array ni seedha object mile
    $addFields:{
      //overwirte kar rahe owner field ko hi so that usme array containg object ke bajae sirf object rahe
      owner: { 
            $first:"$owner"
      }

    }
  }

   ]

  }

}


  ])

  return res.status(200)
  .json( new ApiResponse(200,user[0].watchHistory,"Watch history fetched successfully"))


})


export {registerUser,loginUser,logoutUser,
  refreshAccessToken,changeCurrentPassword,
  getCurrentUser,updateAccountDetails,updateUserAvatar,
   updateUserCoverImage,getUserChannelProfile,
  getWatchHistory}

/**
 
Refresh token saved but access token is not because -

short Lifespan of Access Tokens:

Access tokens are typically short-lived, often expiring within minutes to an hour. Storing them in the database is not practical because they would need to be frequently updated.
Reduced Attack Surface:

Access tokens, if compromised, provide direct access to resources. By not storing them, you reduce the risk of them being leaked or accessed by unauthorized parties.
Stateless Authentication:

Access tokens are usually used in stateless authentication systems (e.g., JWTs). They are self-contained and can be verified without a database 
lookup. This allows the system to scale better and reduces the load on the database.

When we say that access tokens, particularly JSON Web Tokens (JWTs), are "self-contained," we mean that they carry all the information needed 
for authentication within the token itself. This allows the server to verify and understand the token without needing to query a database or any external storage. 
 */