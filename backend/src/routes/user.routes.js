import { Router } from "express";
import { allUsers, loginUser, registerUser, updateUserAvatar } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }
]), registerUser);
router.route("/login").post(loginUser);
router.route("/").get(protect, allUsers);
router.route("/avatar").patch(protect, upload.single("avatar"), updateUserAvatar)
export default router;