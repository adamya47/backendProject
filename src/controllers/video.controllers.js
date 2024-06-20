import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { deleteFile } from "../utils/cloudinary.js"


 //TODO: get all videos of a user based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
 
    

    
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query //req.query refers to an object containing a property for each query parameter in the URL.
                                  //query is a string , like what user typed to search the video 
                                  //we will use regex to search the video by matching this pattern in title and description
                                  //jahan bhi mili vo le lenge
    
                                  if(!(mongoose.Types.ObjectId.isValid(userId))){
                                    throw new ApiError(400,"Invalid userId")
                                }

    

    const user=await User.findById(userId)
  
    if(!user){
        throw new ApiError(404,"Error while finding user")
    }

    //js                               //parse int used to convert string to int
    const pageNumber=parseInt(page)  //JavaScript handles variables as strings by default unless specified otherwise. Therefore, when you receive data from a web form or a URL query parameter, it usually arrives as a string.
                                    
    const pageLimit=parseInt(limit)

    const skip=(pageNumber-1)*pageLimit //skip is like agr 2 page pe jana toh kitna skip krna ,page 3 pe jana toh kitni item skip

    console.log(pageNumber, skip, pageLimit, "from video pagelimit")

/// APPLICABLE ONLY WHEN USING PAGINATION ---
//dont use await b/c : - Using await with Video.aggregate([...]) would execute the aggregation pipeline immediately, preventing aggregatePaginate from modifying the pipeline for pagination. By not using await, you pass the unexecuted aggregation object to aggregatePaginate, allowing it to append additional stages and handle pagination correctly.
// When you use await with Video.aggregate([...]), the aggregation pipeline is executed immediately. ,
// Pagination plugins like mongoose-paginate-v2 expect to receive an aggregation object (not yet executed) so that they can append pagination-specific stages ($skip, $limit) to the pipeline before executing it.

// If the aggregation pipeline is already executed (due to await), the pagination plugin cannot modify the pipeline to add these necessary stages for pagination.
    const aggregatedVideos=Video.aggregate([
               {
        $match:{
            $or:[
                {title:{$regex:query ,$options:"i"}}, //like agr hum search kare "worl" toh yeh query hogi aur regex search karega iss patern ko, here title field mein ,"i" is option here that makes the search case insensitive
                {description:{$regex:query,$options:"i"}},//The exact number of documents returned by $regex in MongoDB aggregation depends on how specific your regex pattern is and how many documents in your collection match that pattern. It can return one document or multiple documents based on the matches found in the specified field(s) of your collection
                {_id:new mongoose.Types.ObjectId(userId)}
            ]
        }
       },
       //2 obtaiing video owner details

       {
        $lookup:{
            from:"users",
           foreignField:"_id",
           localField:"owner",
           as:"ownerDetails ",
           pipeline:[
            {
                $project:{
                    username:1,
                    fullName:1,
                    avatar:1
                }
            },{
                $addFields:{
                    ownerDetails:{
                        $first:"$ownerDetails"
                    }
                }
            }
           ]
        }
       },
       //this stage will help in obtaining comments on each video document

       {
        $lookup:{
            from:"comments",
            foreignField:"video",
            localField:"_id",
            as:"commentsOnVideo",
            pipeline:[
                {
                    //operation we want to do on comment document 
                    $project:{
                        content:1,
                        owner:1
                    }

            }
        ]
        }
       },


       {

        $lookup:{

            from:"likes",
            foreignField:"video",
            localField:"_id",
            as:"likesOnVideo",

            pipeline:[

                {
                    $project:{
                        likedBy:1,

                    },
                   
                      
                    

            }
        ]

        }


       },{
        
        $addFields:{
            totalLikes:{
              $size:"$likesOnVideo"
            }
        }
           
        }
       
        ,

        {
           $sort:{ //When you need to use a variable to specify the property name dynamically, you use square brackets ([variable]).so that sortBy ki value mile jo obtain hoi from req.query and seedha sortBy na likha ho
                [sortBy]:sortType==="desc"?-1:1,//prrimary way to sort
                createdAt:-1  //secondary way to sort incase primary mein two matching 
            }
        }

        ,
        {
            $skip:skip
        }

        ,
        {
            $limit:pageLimit
        }




       

    ])

    if(!aggregatedVideos){
        throw new ApiError(500,"Failed to obtain video")
    }
                                                                            //    const options={
                                                                            //     page:pageNumber,
                                                                            //    limit:pageLimit
                                                                            //     } 
const videoAggregatePaginate=await  Video.aggregatePaginate(aggregatedVideos) // we could add options separetly too Video.aaggregatePaginate(obainedVideo,options)
                                                                          //but we added thode things durinng pipeline too ,toh ab need nhi
if(!videoAggregatePaginate){

    throw new ApiError(500,"some issue while  obtaining video")
}

return  res.status(200).json(new ApiResponse(200,videoAggregatePaginate,"video aggregated and paginateed successfully"))



}

//page and limit in aggrgeatePaginate option

)
const publishAVideo = asyncHandler(async (req, res) => {
    
    // TODO: get video, upload to cloudinary, create video

 try {
       const { title, description} = req.body

       //yeh jo multer upload se aari 
console.log("1")

       const video=req.files?.videoFile?.[0]?.path
       const thumbnail=req.files?.thumbnail?.[0]?.path

       if(!video || !thumbnail){
        throw new ApiError(404,"Error while obtaining video or thumbail")
       }

    const videoUploaded=await uploadOnCloudinary(video)
    const thumbailUploaded=await uploadOnCloudinary(thumbnail)

    
//todo-duration of video from 



if(!videoUploaded || !thumbailUploaded){

    throw new ApiError(500,"Error while uploading video or thumbail on Cloudinary")

}

//console.log(videoUploaded)
//console.log(videoUploaded.public_id)






const videoReturned=await Video.create({

videoFile:videoUploaded.url,
thumbnail:thumbailUploaded.url,
owner:req.user._id,
title,
description,
duration:videoUploaded.duration,
isPublished:true,
views:0,
})




if(!videoReturned){
    throw new ApiError(500,"Error while uploading video")
}

const createdVideo=await Video.findById(videoReturned._id)


if(!createdVideo){
    throw new ApiError(500,'Not able to upload video')
}

return res.status(200).json(
new ApiResponse(200,
    videoReturned,"Video Published Successfully"
)
)



    



 } catch (error) {
     console.log("Caught error",error)
 }




})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}