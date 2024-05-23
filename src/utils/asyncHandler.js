//approch 2 using promise


const asyncHandler=(fn)=>{
    return (req,res,next)=>{
        Promise.resolve(fn(req,res,next)).catch((error)=>next(error))
    }
}

export {asyncHandler}


/*
STUDY APPROACH 1 FIRST GIVEN BELOW
CONCEPTS USED IN APPROACH 2.
the function returned by asyncHandler takes the standard Express route handler parameters: req, res, and next

Inside the returned function, fn is called with req, res, and next as arguments. It is wrapped in Promise.resolve() to ensure that any 
value returned by fn is treated as a promise. This is useful because fn could either be an async function (which returns a
 promise) or a regular function (which may return a value or nothing).

If fn is an async function: It returns a promise. Promise.resolve will simply return that promise.
If fn is a regular function: It might return a value or nothing. Promise.resolve will create a promise that resolves with the
 returned value (or undefined if nothing is returned).

.catch block will catch the error and pass it to next(err). This ensures that errors are handled properly by Express's error-handling middleware.
.catch((err) => next(err)) catches any errors and passes them to the next middleware.
*/

//approach 1 -using try and catch 

/*
concept used 
asyncHandler=()={}
asyncHandler=(fn)={}
asyncHandler=(fn)={async()=>{}}
asyncHandler=(fn)=async()=>{}


 
asyncHandler is a higher-order function, meaning it takes a function fn as an argument and 
returns a new function.
which is used to wrap asynchronous functions in Express.js

(err,req,res,next)
 These are the three arguments commonly used in Express middleware functions
fn here is mostly express middleware function



const asyncHandler=(fn)=>async(req,res,next)=>{

try {
    await fn(req,res,next)
} catch (error) {
    res.status(error.code||500).json({
        success:false,
        message:error.message
    })
}

}
The status method sets the HTTP status to 500 (Internal Server Error).
res.status(error.code || 500): Sets the HTTP status code to error.code if it exists, otherwise defaults to 500.
.json({ ... }): Sends a JSON response with an object containing the error details, typically including a success flag (set to false) and an error message.

*/