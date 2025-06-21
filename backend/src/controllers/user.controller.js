import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";

// Register New User
const registerUser= asyncHandler(async (req, res)=> {
    const {name, email, password}= req.body

    if(!name || !email || !password){
        throw new ApiError(400, "Enter all the fields")
    }

    const userExists= await User.findOne({email})

    if(userExists){
        throw new ApiError(409, "User already exists")
    }

    const avatarLoaclPath= req.file?.path
    let avatar
    
    if(avatarLoaclPath){
        avatar= await uploadOnCloudinary(avatarLoaclPath)
    }

    const user= await User.create(
        {
            name,
            email,
            password,
            avatar
        }
    )

    const createdUser= await User.findById(user._id).select(
        "-password"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while user registration")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registerd successfully")
    )
})

// Login User
const loginUser= asyncHandler(async(req, res)=>{
    const {email, password}= req.body
    
    if(!(email || password)){
        throw new ApiError(400, "Email or password is required")
    }

    const user= await User.findOne({
        email
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const loggedInUser= await User.findById(user._id).select("-password")

    return res.status(200).json(
        new ApiResponse(200, {user: loggedInUser, token: generateToken(user._id)}, "User logged in successfully")
    )
})

// Serach User
const allUsers= asyncHandler(async(req, res)=>{
    const keyWord= req.query.search?
    {
        $or: [
            {name: {$regex: req.query.search, $options: "i"}},
            {email: {$regex: req.query.search, $options: "i"}}
        ]
    }: {}

    const user= await User.find(keyWord).find({
        _id: {$ne: req.user._id}
    }).select("-password").sort("-createdAt")

    return res.status(200).json(
        new ApiResponse(200, user, "All users fetched successfully")
    );
})

export {registerUser, loginUser, allUsers};