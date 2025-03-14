import mongoose from "mongoose";

import express from "express"
import connectDB from "./db/index.js";
//require('dotenv').config({path:'./env'})
import  dotenv from "dotenv"
dotenv.config({
    path:'.\env'
})
//hamne connect db async kra hai to promise return krega 

connectDB().
then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port :${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed",err)
})

/*
function connectDB(){}




//more beeter approach using iffy
/*
const app=express()
(async()=>{
    try{
       await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
app.on("error",()=>{
    console.log("error",error);
    throw error
})
app.listen(process.env.PORT,()=>{
    console.log(`App is listening on port ${

    }`)
})
    }catch(error){
        console.log("ERROR",error);
        throw error
    }
})()*/

//Approach 2 diff folder mai kro kaam 