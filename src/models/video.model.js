import mongoose,{Schema} from "mongoose";


//refer npm docs to know how to establish mongoose Aggregate paginate
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2"); //cause videos boht sari ho sakti hai aur sari toh user ko ek sath de nahi sakte thodi thodi krke denge

const videoSchema=new Schema({
    videoFile: {
        type: String, //cloudinary url
        required: true
    },
    thumbnail: {
        type: String, //cloudinary url
        required: true
    },
    title: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    },
    duration: { //this will also come from cloudanary ,as it tells the duration of video too
        type: Number, 
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

      })
 
videoSchema.plugin(mongooseAggregatePaginate); //plugin used to add khud ke plugin ,aur yeh aggregate paginate thoda baad mein aaya hai in mongoose
                                                //isliye we use .plugin() hook

export const Video=mongoose.model("Video",videoSchema)


/**
 * he need and use of mongoose-aggregate-paginate (or similar libraries that provide pagination for MongoDB aggregation queries) arise from the
 * necessity to efficiently handle large datasets by breaking them into smaller, more manageable chunks or pages. This approach enhances 
 * performance, user experience, and overall system manageability.
 * 
 * Reduced Load: Fetching large datasets in a single query can be resource-intensive and slow. Pagination reduces the load by limiting the 
 * number of documents processed and transferred in each request.
 * 
   Memory Management: Handling smaller sets of data reduces memory usage on both the server and client sides.

   Faster Response Times: Users get quicker responses because the server processes smaller amounts of data.
 */