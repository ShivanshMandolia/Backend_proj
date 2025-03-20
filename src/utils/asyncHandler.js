const asyncHandler=(requestHandler)=>{
return    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


export {asyncHandler}


//const asynchandler=(func)=>{()=>{}}
    //async bnado aur brXKET htado const async handler=(fun)=>async()=>{}
        //nexct isliye liya kyuki middleware bhi ho skte hai



//WRAPPIN GFN USING ASYNC AWAIT 
        /*const asyncHandler=(fn)=>async (req,re,next)=>{
    try{
await fn(req,res,next)
    }
    catch(error){
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}*/