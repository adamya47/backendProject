import {v2 as cloudinary} from "cloudinary"
import fs, { unlink } from "fs"


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});


//GOAL HERE - the file is already on our local server ,from there we have to take local path and uplaod file to cloudinary and also delete it
//from local server

//hum simply copy paste bhi kr sakte hai cod form website but the thing is hum proper unlink bhi karenge after upload,try catch se proper error 
//handling bhi toh uske lia we make a more structured function it will use the things told in the website so its needed too.

const uploadOnCloudinary=async (localFilePath)=>{
try {
    if(!localFilePath)return null;//agr file path dia hi  nahi
    
    //upload file
    const response=await cloudinary.uploader.upload(localFilePath,{resource_type:auto}) ;
    console.log("File uploaded on cloudinary",response.url);
    fs.unlinkSync(localFilePath); //there is an option fs.unlink() too but we want yeh hona hi hoona chahiye in code flow isliye yeh kia
    return response;
    

} catch (error) {
 
    //agr error aa gaya toh delete hi krdo cause aaese hi rakhke koi fyda ni
    fs.unlinkSync(localFilePath);
    return null;
    
}

}

export default uploadOnCloudinary


/*
the response returned from cloudinary looks something like this-
{ 
  public_id: 'cr4mxeqx5zb8rlakpfkg',
  version: 1571218330,
  signature: '63bfbca643baa9c86b7d2921d776628ac83a1b6e',
  width: 864,
  height: 576,
  format: 'jpg',
  resource_type: 'image',
  created_at: '2017-06-26T19:46:03Z',
  bytes: 120253,
  type: 'upload',
  url: 'http://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg',
  secure_url: 'https://res.cloudinary.com/demo/image/upload/v1571218330/cr4mxeqx5zb8rlakpfkg.jpg' 
}

*/