import mongoose,{Schema} from "mongoose";

const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2"); //sare comments ek sath ni de sake thode thode krke dena hai


const commentSchema=new Schema({

content:{
    type:String,
    required:true,
    trim:true,
},
//jis video pe kia uski id 
video:{
    type:Schema.Types.ObjectId,
    ref:"Video"
},
owner:{//user who owned that video

    type:Schema.Types,ObjectId,
    ref:"User"
}



},{
    timestamps:true
})

commentSchema.plugin(mongooseAggregatePaginate) //plugin use kaise ,study krna (this pagginate gives us ability ke ek call pe kitne comments dekhane hai)

export const Comment=mongoose.model("Comment",commentSchema)