class ApiError extends Error{
    constructor(statusCode, message= "Something went wrong", erros= [], stack=""){
        super(message)
        this.statusCode= statusCode
        this.data= null
        this.success= false
        this.erros= erros

        if(stack){
            this.stack= stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}