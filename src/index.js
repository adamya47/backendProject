import 'dotenv/config'
import express from "express"
import { connectDB } from "./db/index.js";
import app from './app.js';



//as connectDB is asynchrounous to vo promise return krta hai isliye we can use then()

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Server is listening to Port:",process.env.PORT)
    })
}).catch((error)=>{
 console.log("MongoDB connection Failed!!",error)
})






/*APPROCH 1 FOR DB CONNECTION (IN SAME FILE)
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //thats why we removed / from URI cause hum khud likhte hai and we 
        //                                                                 add DB_NAME too
       
       
        //after connecting to database if theres an issue with express's app toh for that we do 
        app.on("error",(error)=>{
            console.log("Express Error:",error)
            throw error

        })
 //fir listen bhi krte hain

  app.listen(process.env.PORT,()=>{
    console.log(`App is Listening on port ${process.env.PORT}`)


  })
    } catch (error) {
        console.log("Error:",error)
        throw error
    }

})()
*/