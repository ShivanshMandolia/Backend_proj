import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {ApiError} from "../utils/ApiError.js"
import {uploadOnCloudinary}from"../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import path from "path";
import jwt from "jsonwebtoken";
//asynchandler fn lega
const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
//put value of resfresh token in user db
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
} 
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})
const loginUser=asyncHandler(async(req,res)=>{
     //req bofy->data
     //username or email  
     //find user
     //password check
     //acess and refresh token
     //send cookies


     const {email,username,password}=req.body
     if(!(username||email)){
        throw new ApiError(400,"username or email required")
     }
     //if registered fro db
     //User.findOne({email})
     //agar dono  mai se ek bhi chumlo
     const user = await User.findOne({
        $or: [{ username: username }, { email: email }]
    });
    if (!user) {
        throw new ApiError(400, "User does not exist");
    }
    console.log("Login request received with:", req.body);

    
     //User se ni krenge kyuki ye mongo ka hai 
     //but generate token password correct wle method user mai lgenge

     const isPasswordValid =await user.isPasswordCorrect(password)
     if(!isPasswordValid){
        throw new ApiError(401,"Incorrect Password")

     }
    const {accessToken,refreshToken}= await generateAccessAndRefereshTokens(user._id);

    //send in cookies
   const loggedinUser=await User.findById(user._id).select("-password -refreshToken")

     const options={
        httpOnly:true,
        secure:true
     }
     return res.status(200).cookie("accessToken",accessToken,options).cookie(
        "refreshToken",refreshToken,options
     ).json(
        new ApiResponse(
            200,
            {
                user:loggedinUser,accessToken,
                refreshToken
            },
            "User logged in succesfully"
        )
     ) 

})
const logoutUser=asyncHandler(async(req,res)=>{
    //par  konse user mo lohout kre  so we use middleware
   await  User.findByIdAndUpdate(req.user._id,
        
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).
    clearCookie("refreshToken",options).json(
        new ApiResponse(200,{},"user logged out")
    )
})//access token refrewsh
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
//verify access token
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    //if verified 
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    //user se bs refresh token dekhenge
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {registerUser,loginUser,logoutUser,refreshAccessToken};
