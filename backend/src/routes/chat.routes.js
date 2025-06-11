import { Router } from "express";
import { accessChat, addToGroup, createGroupChat, fetchChats, removeFromGroup, renameGroup } from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat)
router.route("/rename").put(protect, renameGroup);
router.route("/groupAdd").put(protect, addToGroup);
router.route("/groupRemove").put(protect, removeFromGroup);

export default router;