import mongoose, {Schema} from "mongoose";

const chatSchema = new Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ],
    latestMessage: {
        type: mongoose.Types.ObjectId,
        ref: "Message"
    },
    groupAdmin: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true});

export const Chat= mongoose.model("Chat", chatSchema)