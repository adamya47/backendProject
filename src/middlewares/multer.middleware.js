import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { //cb callback 

      cb(null, "./public/temp") //null cause here we dont want to deal with errors
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)//using originalname not a good practise we should use something unique .but still here it wont affect 
    }
  })
  
  export const upload = multer({ storage: storage }) //upload variable is now a middleware function that can be used to handle file uploads


  /**
   * ----------------------------------------------------------------------------------------------------------------------------------------------
   *now humne jahan bhi upload krna hoga there we would do use upload middleware like this for uploading single file (for multiple files(ref docs)


                       //this is middleware 
                           |  |  |  |  |  |
                           v  v  v  v  v  v
   app.post('/profile', upload.single('avatar'), function (req, res, next) {

  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any

})
   
---------------------------------------------------------------------------------------------------------------------------------------------------
destination-> (diskstorage vs memory storage)


Disk Storage:diskStorage is a storage engine in Multer that saves the uploaded files directly to the disk. This is how it works:

Location: Files are stored on the disk (hard drive or SSD) in a specified directory.


Pros: Persistent storage, handles large files well, configurable storage location and filename.
Cons: Slower I/O operations, requires cleanup of stored files.

Memory Storage: memoryStorage is a storage engine in Multer that stores the uploaded files in memory as Buffer objects.Files are stored in the 
                server’s memory (RAM)
        buffer- a buffer is a region of physical memory storage used to temporarily store data while it is being moved from one place to another

Pros: Fast access, suitable for small files, easy to use for temporary file handling.
Cons: Non-persistent, limited by server memory, not suitable for large files.


-----------------------------------------------------------------------------------------------------------------------------------------------------


   */