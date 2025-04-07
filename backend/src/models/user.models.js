import mongoose, {Schema} from "mongoose";

const userSchema= new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    avatar: {
        type: String,
        require: true,
        default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: true
    }
}, {timestamps: true});

export const User= mongoose.model("User", userSchema);