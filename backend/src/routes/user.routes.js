import { Router } from "express";
import { 
    registerUser, 
    loginUser, 
    searchUsers, 
    getAllUsers, 
    updateUserAvatar 
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// ===== PUBLIC ROUTES (No Authentication Required) =====

// Register user - POST /api/users/register
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]), 
    registerUser
);

// Login user - POST /api/users/login
router.route("/login").post(loginUser);

// ===== PROTECTED ROUTES (Authentication Required) =====

// Get all users for sidebar - GET /api/users/
router.route("/").get(protect, getAllUsers);

// Search users - GET /api/users/search?search=query
router.route("/search").get(protect, searchUsers);

// Update user avatar - PATCH /api/users/avatar
router.route("/avatar").patch(
    protect, 
    upload.single("avatar"), 
    updateUserAvatar
);

export default router;