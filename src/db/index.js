import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";

 //APPROCH 2 FOR DB CONNECT 
export const connectDB=async ()=>{
try {
 const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // VVIMP.this returns an object which can be stored

 console.log(`MONGO DB CONNECTED!! TO DB HOST:${connectionInstance.connection.host}`) //application of that object





} catch (error) {
    console.log("DB CONNECTION FAILED",error)
    process.exit(1)
}


}