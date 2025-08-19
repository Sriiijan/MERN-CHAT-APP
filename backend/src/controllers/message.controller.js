import { Chat } from "../models/chat.models.js";
import { Message } from "../models/message.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMesssage= asyncHandler(async (req, res) => {
    const {content, chatId}= req.body;

    if(!content || !chatId) {
        throw new ApiError(400, "Invalid data passed in request")
    }

    var newMessage= {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        var message= await Message.create(newMessage);

        message= await message.populate("sender", "name avatar");
        message= await message.populate("chat");
        message= await User.populate(message, {
            path: "chat.users",
            select: "name avatar email"
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message
        });

        return res.status(200).json(
            new ApiResponse(200, message, "Messages send successfully")
        )

    } catch (error) {
        throw new Error(error.message);
    }
})

const allMessages= asyncHandler (async (req, res) => {
    try {
        const messages= await Message.find({chat: req.params.chatId}).populate(
            "sender",
            "name avatar"
        ).populate("chat");
        return res.status(200).json(
            new ApiResponse(200, messages, "Messages fetched successfully")        
        )
    } catch (error) {
        throw new Error(error.message);
    }
})

export {sendMesssage, allMessages};