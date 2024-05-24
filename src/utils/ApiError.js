/*
This class is designed to create custom error objects that can be used in APIs to provide detailed error information. It extends the built-in Error class in JavaScript.
properties like  message ,name ,stack are of Error class 
 baki are created in ApiError 
*/





class ApiError extends Error{

constructor(
    statusCode,
    message="Something went wrong",
    errors=[],
    stack=""
){
super(message)//super(message): This calls the constructor of the parent Error class and initializes the message property that is 
              //inherited from Error
              /**when super(message) is done it  Calls the parent class (Error) constructor with the provided message. This ensures that the Error
             *  class properties such as message, name, and stack are properly initialized. */



//V.IMP-here statusCode member is created and is initialized by statusCode

this.statusCode=statusCode //The HTTP status code associated with the error.
//this.message=message (done in code but not needed)
this.success=false
this.errors=errors
this.data=null //in data, additional data related to error is stored


//The stack property is a string that represents the point in the code at which the error was instantiated.
if(stack){
    this.stack-stack
}else{
    Error.captureStackTrace(this,this.constructor) // This method allows you to manually capture the stack trace at the point where it's called
    /*Error.captureStackTrace(targetObject[, constructorOpt])
targetObject: The object on which the stack trace will be captured. Typically, this would be the instance of your custom error class.
constructorOpt (optional): A function whose name will be excluded from the stack trace. This is useful to avoid showing the constructor of 
the error class in the stack trace, focusing on the point where the error was created. */
}


}

}
export {ApiError}

/**
 The Error class in JavaScript typically has properties such as message, name, and stack.
 When you define properties like statusCode in the constructor of ApiError, these properties are specific to instances of the ApiError class 
 and are not inherited from the Error class.
 Similar to statusCode, these properties (data, success, errors) are defined within the ApiError class and are specific
  to instances of ApiError

 When super(message); is executed, it does the following:

Passes the message argument to the Error class constructor.
The Error class constructor initializes the message property with the provided message.
The Error class also typically sets up the name property (with the value "Error" by default) and the stack property, which contains the stack trace.
 */