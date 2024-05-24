//It is made to standerized APIresponse

class ApiResponse{


constructor(statusCode,
    data,message="Success"){

    this.statusCode=statusCode
    this.data=data
    this.message=message
    this.success=statusCode<400  //this is done cause 400 ke upr we consider it as error and 400 ke niche we consider it as response 
                                 //so success true if statusCode <400

    }


}
export {ApiResponse} 

/*
Informational responses (100 – 199)
Successful responses (200 – 299)
Redirection messages (300 – 399)
Client error responses (400 – 499)
Server error responses (500 – 599)

*/