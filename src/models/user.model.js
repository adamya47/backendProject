import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt"



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