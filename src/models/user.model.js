import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema({
    username:{
        type : String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        //for better searching
        index:true
    },
    email:{
        type : String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullname:{
        type : String,
        required:true,
        lowercase:true,
        trim:true,
        index:true

    },
    avtar:{
        type:String,//cloudenary url
        required:true,
    },
    coverImage:{
        type:String,

    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    Password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String
    },



},{timestamps:true})
//jab data save ho usse pehle password encrypt 
userSchema.pre("save", async function (next) {
    //kuch bhi user mai change hoke password encrypt hota rhega isliye bs jab password modify hi tbhi use krnege

    //agar modufy ni hua to return hojao next -pe 
    if(!this.isModified("password")) return next();
//else 
//bcrypt is used to hash in rounds
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
//bcrypt is used to check password  it compare string and encrypted pass->this. wla
userSchema.methods.isPasswordCorrect = async function(password){
    //either true otr false
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
    //sign generate token
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}






export const User=mongoose.model("User",userSchema)