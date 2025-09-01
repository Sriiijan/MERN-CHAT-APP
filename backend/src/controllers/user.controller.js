import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateToken } from "../utils/generateToken.js";

// Register New User
const registerUser = asyncHandler(async (req, res) => {
    console.log("=== REGISTRATION DEBUG START ===");
    
    const { name, email, password } = req.body;
    // console.log("Body data:", { name, email, password: password ? "***" : "missing" });

    if (!name || !email || !password) {
        throw new ApiError(400, "Enter all the fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(409, "User already exists");
    }
    
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log("Avatar Local Path:", avatarLocalPath);
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    console.log("Starting Cloudinary upload...");
    
    try {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Cloudinary upload result:", avatar);
        
        if (!avatar) {
            console.error("Cloudinary returned null/undefined");
            throw new ApiError(400, "Cloudinary upload failed - no response");
        }

        if (!avatar.secure_url && !avatar.url) {
            console.error("Cloudinary response missing URL:", avatar);
            throw new ApiError(400, "Cloudinary upload failed - no URL returned");
        }

        console.log("Cloudinary upload successful:", avatar.secure_url || avatar.url);

        const user = await User.create({
            name,
            email,
            password,
            avatar: avatar.secure_url || avatar.url
        });

        const createdUser = await User.findById(user._id).select("-password");

        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while user registration");
        }

        console.log("=== REGISTRATION SUCCESS ===");

        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );

    } catch (cloudinaryError) {
        console.error("=== CLOUDINARY ERROR ===");
        console.error("Error details:", cloudinaryError);
        console.error("Error message:", cloudinaryError.message);
        console.error("Error stack:", cloudinaryError.stack);
        
        throw new ApiError(400, `Cloudinary upload failed: ${cloudinaryError.message}`);
    }
});

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

//Update Avatar
const updateUserAvatar= asyncHandler(async (req, res) => {
    const avatarLocalPath= req.file?.path;
    // console.log("AVATAR LOCAL PATH: ", avatarLocalPath);
    

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing");
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath);

     console.log("AVATAR: ", avatar);

    if(!avatar) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    console.log("USER: ", req.user?._id);
    

    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    )

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )
});

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

export {registerUser, loginUser, allUsers, updateUserAvatar};