import { Router } from "express";
import { allUsers, loginUser, registerUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(registerUser)
router.route("/login").post(loginUser)
router.route("/").get(protect, allUsers);
export default router;