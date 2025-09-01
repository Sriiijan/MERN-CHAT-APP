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

    // Validate required fields
    if (!name || !email || !password) {
        throw new ApiError(400, "Name, email, and password are required");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(409, "User already exists with this email");
    }
    
    // Handle avatar upload (make it optional for deployment)
    let avatarUrl = null;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    
    if (avatarLocalPath) {
        console.log("Avatar Local Path:", avatarLocalPath);
        console.log("Starting Cloudinary upload...");
        
        try {
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            console.log("Cloudinary upload result:", avatar);
            
            if (avatar && (avatar.secure_url || avatar.url)) {
                avatarUrl = avatar.secure_url || avatar.url;
                console.log("Cloudinary upload successful:", avatarUrl);
            } else {
                console.warn("Cloudinary upload failed, proceeding without avatar");
            }
        } catch (cloudinaryError) {
            console.error("=== CLOUDINARY ERROR ===");
            console.error("Error details:", cloudinaryError);
            // Don't throw error, just log and continue without avatar
            console.warn("Proceeding without avatar due to upload error");
        }
    }

    // Create user with or without avatar
    const user = await User.create({
        name,
        email,
        password,
        avatar: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    console.log("=== REGISTRATION SUCCESS ===");

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Get user without password
    const loggedInUser = await User.findById(user._id).select("-password");

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser, token }, "User logged in successfully")
    );
});

// Search Users (renamed from allUsers for clarity)
const searchUsers = asyncHandler(async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const searchQuery = req.query.search;
        
        let searchFilter = { _id: { $ne: loggedInUserId } };
        
        // If search query is provided, add search conditions
        if (searchQuery && searchQuery.trim()) {
            searchFilter.$or = [
                { name: { $regex: searchQuery, $options: "i" } },
                { email: { $regex: searchQuery, $options: "i" } }
            ];
        }

        const users = await User.find(searchFilter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(50); // Limit results for performance

        return res.status(200).json(
            new ApiResponse(200, users, "Users fetched successfully")
        );
    } catch (error) {
        console.error("Error in searchUsers:", error);
        throw new ApiError(500, "Error while fetching users");
    }
});

// Get all users for sidebar (separate from search)
const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        
        const users = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, users, "All users fetched successfully")
        );
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        throw new ApiError(500, "Error while fetching users");
    }
});

// Update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    try {
        console.log("Uploading avatar to Cloudinary...");
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        
        if (!avatar || (!avatar.url && !avatar.secure_url)) {
            throw new ApiError(400, "Error while uploading avatar to Cloudinary");
        }

        const avatarUrl = avatar.secure_url || avatar.url;
        console.log("Avatar uploaded successfully:", avatarUrl);

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: { avatar: avatarUrl } },
            { new: true }
        ).select("-password");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, user, "Avatar updated successfully")
        );
        
    } catch (error) {
        console.error("Error in updateUserAvatar:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Error while updating avatar");
    }
});

// Export all functions
export { 
    registerUser, 
    loginUser, 
    searchUsers, 
    getAllUsers, 
    updateUserAvatar 
};