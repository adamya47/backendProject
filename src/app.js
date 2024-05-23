import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app=express()

// "use" method used for middleware and config.

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
})) 
//credentials" refer to user-specific data, such as cookies, authorization headers,
// or TLS client certificates
//usually brower dont send credentials to server on cross origin request but sometimes it needed  like for authorization or session data

//we get data in backend in many ways like in url ,json ,or body(form)

app.use(express.json({limit:"16kb"})) //It means we accept json ,express.json() helps in converting json to JavaScript object
                                      //putting limit so server overload na ho jae

//initially express needed body parser to accept json format but ab nahi ,now its by default



// * It encodes/parses the incoming url
app.use(express.urlencoded({extended:true,limit:"16kb"})) //express.urlencoded is a middleware function
                                             //extended true matlab object ke andr bhi object de skate hain


app.use(express.static("public"))  //it is used to store files or folders in server so that it can be served to the client
                       //public folder mein karr rahe isliye public likha idhr 

app.use(cookieParser()) //used to set or access cookies


export default app