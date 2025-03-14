import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"
const app=express()
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
       credentials:true
    }
))
//limit of json file
app.use(express.json({limit:"16kb"}))
//for url se data aaye jb
app.use(express.urlencoded({extended:true,limit:"16kb"}))
//static for pdf images folders /public stts
app.use(express.static("public"))
//For file upload->multer

//secure cookies only read and remove by server
app.use(cookieParser()) 
export { app }