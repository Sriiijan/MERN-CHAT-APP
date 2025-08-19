import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { sendMesssage, allMessages } from "../controllers/message.controller.js";


const router= Router()

router.route('/').post(protect, sendMesssage)
router.route('/:chatId').get(protect, allMessages)
export default router;