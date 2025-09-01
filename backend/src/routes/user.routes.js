import { Router } from "express";
import { allUsers, loginUser, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

// Register user - POST /api/user/register
router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), registerUser);

// Login user - POST /api/user/login
router.route("/login").post(loginUser);

// Get all users - GET /api/user/search (or /api/user/all)
router.route("/search").get(protect, allUsers);

// Update avatar - PATCH /api/user/avatar
router.route("/avatar").patch(protect, upload.single("avatar"), updateUserAvatar);

export default router;