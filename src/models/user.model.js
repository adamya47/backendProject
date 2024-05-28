import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const userSchema=new Schema({ 
    //id will come from mongoose
    username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true, 
    index: true //index true krne se we make fields ko searchable bana denge in optimized way .
               //It is essential for optimizing query performance and ensuring efficient data retrieval.
},
email: {
    type: String,
    required: true,
    unique: true,
    lowecase: true,
    trim: true, 
},
fullName: {
    type: String,
    required: true,
    trim: true, 
    index: true
},
avatar: {
    type: String, // cloudinary url
    required: true,
},
coverImage: {
    type: String, // cloudinary url
},
watchHistory: [
    { 
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
],
password: {
    type: String,
    required: [true, 'Password is required']
},
refreshToken: {
    type: String
}



},{timestamps:true});





//this will encrypt the passoword before saving it in db

            //(konse event pe,traditional function callback)
userSchema.pre("save",async function(next){//next required cause middleware working,we want to pass next flag to next middleware
  
    if(!this.isModified("password"))return next();  //Problem:we have set ki if anything "save" toh passowrd encrypt kardo but hume sirf tabhi krna hai
                                                    //jab password create/update hoa ho 
                                                    //to fix that we used this ki agr passoword mein no change simply next middle ware pe flag pass krdo

                                 //(kya hash krna hai,cost factor (or salt rounds))
    this.password=await bcrypt.hash(this.password,10); //we used technique 2 
    next();

});




//we create this method isPassowordCorrect to check the password entered in simple string and encrypted passoword in data base
//here methods object mein we created a key isPasswordCorrect which contain the following function.

//creating custom method
userSchema.methods.isPasswordCorrect=async function(password){

    return await bcrypt.compare(password,this.password);//this will return true or false
}


userSchema.methods.generateAccessToken=function(){
//async await not  needed as it is very fast
    //this will return jwt token
return jwt.sign({
    //payload
    _id:this._id,
    email:this.email,
    fullName:this.fullName,
    username:this.username,
},process.env.ACCESS_TOKEN_SECRET,process.env.ACCESS_TOKEN_EXPIRY)
}

userSchema.methods.generateRefreshToken=function(){
    //async await not  needed as it is very fast
        //this will return jwt token
    return jwt.sign({
        //payload
        _id:this._id, //isme payload kaam dete 
    },process.env.REFRESH_TOKEN_SECRET,process.env.REFRESH_TOKEN_EXPIRY)
    }


export const User=mongoose.model("User",userSchema);














/**
 bcrypt
 bcrypt.js is a JavaScript library commonly used for hashing passwords and ensuring secure storage and authentication of user credentials. 
 Here’s why bcrypt.js is widely used:

 Strong Hashing Algorithm: bcrypt is based on the Blowfish cipher and is designed to be computationally intensive, making it resistant 
 to brute force attacks.
Salt Generation: bcrypt automatically generates a salt for each password, which ensures that even if two users have the same password, 
their hashed passwords will be different.
Adaptive Hashing: bcrypt allows you to increase the complexity of the hashing process over time as computational power increases,
 by adjusting the "cost factor" or salt round

 How Salt works
 Generate a Salt: A random value is generated. The length of the salt is often a fixed size.

Combine Salt and Password: The salt is combined with the password, usually by concatenating them.

Hash the Combined Value: The combined salt and password are then passed through the hash function to produce the hash output.

Store the Salt with the Hash: The salt is stored alongside the hash in the database. This allows the salt to be used again when verifying the
 password.

 */

 /**
  * ----------------------------------------------------------------------------------------------------------------------------------------------
  JWT (JASON WEB TOKEN),its like a bearer token,jiske bhi pass hoga usko sahi/authentic maan lege aur data bhej denge,its like a key

Imagine you have a secret club with a special badge that grants access. A JWT (JSON Web Token) is kind of like that badge, but for digital 
information. Here's a breakdown:

What is a JWT?

A JWT is a compact way to securely transmit information between two parties.
It's like a little envelope containing important details in a format that's easy to send around (JSON) and tamper-proof (signed).
Why is it needed?

Traditional methods of keeping track of who's logged in (like session cookies) can be cumbersome and insecure.
JWTs offer a more efficient and secure way to manage user authentication.
What's the purpose?

JWTs are mainly used for two things:

Authentication:

When you log in to an app, it verifies your credentials and creates a JWT with your user information.
This JWT is then sent back to your device (like a badge).
With subsequent requests to the app, you send the JWT instead of logging in again. The app checks the JWT's signature (like verifying the badge) to confirm you're authorized.
Secure Information Exchange:

JWTs can also carry additional information securely between different parts of an application (like different servers).
The signed nature of JWTs ensures the information hasn't been tampered with during transfer.
Benefits of JWTs:

Stateless: The server doesn't need to store session data, making it more scalable.
Secure: Tampering with a JWT is difficult due to the digital signature.
Compact: Easy to transmit between devices.

-------------------------------------------------------------------------------------------------------------------------------------------------
A JWT (JSON Web Token) consists of three main parts, each encoded in Base64url format:

Header (JOSE Header):

Contains metadata about the token itself.
Typically includes:
typ: Identifies the type of token (always "JWT" in this case).
alg: The signing algorithm used (e.g., HS256, RSA).
Payload (Claims Set):

Contains the actual claims, which are pieces of information about the user or the application.
Examples of claims:
sub: Subject (the user ID).
exp: Expiration time of the token.
iat: Issued at time (when the token was created).
Additional custom claims specific to your application (e.g., user role, permissions).
Signature:

This part ensures the integrity of the header and payload.
It's generated by signing the encoded header and payload using the algorithm specified in the header and a secret key (for symmetric algorithms)
or a private key (for asymmetric algorithms).

Key Points:

Each part (header, payload, signature) is encoded to create a URL-safe string.
The signature is created using the cryptographic algorithm specified in the header and a secret key (known only to the server).
When a client receives a JWT, it can verify the signature using the same algorithm and a public key (if asymmetric) to ensure the
token's authenticity and integrity.
  */