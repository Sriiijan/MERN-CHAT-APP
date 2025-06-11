import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/chat.models.js";

const accessChat= asyncHandler(async (req, res)=>{
    const {userId}= req.body;

    if(!userId) { 
        throw new ApiError(400, "User ID is required to access chat");
    }

    var isChat= await CharacterData.find({
        isGroupChat: false,
        $and: [
            {user: {$elementMatch:{$eq: req.user._id}}},
            {user: {$elementMatch:{$eq: userId}}}
        ]
    }).populate("user", "-password").populate("latestMessage")

    isChat= await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    })

    if(isChat.length > 0){
        return res.status(200).json(
            new ApiResponse(200, isChat[0], "Chat already exists")
        );
    }
    else {
        const chatData= {
            chatName: "sender",
            isGroupChat: "false",
            users: [req.user._id, userId]
        };
        try {
            const createdChat=  await Chat.create(chatData);

            const FullChat= await Chat.findOne({_id: createdChat._id}).populate(
                "users",
                "-password"
            );

            return res.status(200).json(
                new ApiResponse(200, FullChat, "New chat created successfully")
            );
        }
        catch(error){
            throw new Error(error.message);
        }
    }
})

const fetchChats= asyncHandler(async (req, res)=>{
    try {
        Chat.findOne({ users: {$elementMatch: {$eq: req.user._id}} })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results)=> {
            results= await User.populate(results, {
                path: "latestMessage.sender",
                select: "name pic email"
            })
    
            return res.status(200).json(
                new ApiResponse(200, results, "Chats fetched successfully")
            )
        })
    } catch (error) {
        throw new ApiError(400, error.message);
        
    }
})

const createGroupChat= asyncHandler(async (req, res)=>{
    const groupName= req.body.name;
    const groupUsers= req.body.users;

    if(!groupUsers || !groupName){
        throw new ApiError(400, "Please fill all the fields");
    }

    var users= JSON.parse(groupUsers);

    if((users.length < 2)){
        throw new ApiError(400, "More than 2 users are required to form a group chat");
    }

    users.push(req.user._id)

    try {
        const groupChat= await Chat.create({
            chatName: groupName,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id
        })
    
        const fullGroupChat= await Chat.findOne({_id: groupChat._id})
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
        return res.ststus(200).json(
            new ApiResponse(200, fullGroupChat, "Group chat created successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message);
    }
})

const renameGroup= asyncHandler(async (req, res)=>{
    const {chatId, chatName}= req.body;

    if(!chatId || !chatName){
        throw new ApiError(400, "Chat ID and chat name are required");
    }

    const updatedChat=  await Chat.findByIdAndUpdate(
        chatId,
        {
            chatName
        },
        {
            new: true
        }
    ).populate("usres", "-password")
    .populate("groupAdmin", "-password");

    if (!updatedChat) {
        throw new ApiError(404, "Chat not found");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedChat, "Group chat renamed successfully")
    )
})

const addToGroup= asyncHandler(async (req, res)=>{
    const {chatId, UsersId}= req.body;

    if(!chatId || !UsersId){
        throw new ApiError(400, "Chat ID and User ID are required");
    }

    const added= await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: UsersId}
        },
        {
            new: true
        }
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!added) {
        throw new ApiError(404, "Chat not found");
    }

    return res.status(200).json(
        new ApiResponse(200, added, "User added to group successfully")
    )
})

const removeFromGroup= asyncHandler(async (req, res)=>{
    const {chatId, UsersId}= req.body;

    if(!chatId || !UsersId){
        throw new ApiError(400, "Chat ID and User ID are required");
    }

    const removed= await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: {users: UsersId}
        },
        {
            new: true
        }
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!removed) {
        throw new ApiError(404, "Chat not found");
    }

    return res.status(200).json(
        new ApiResponse(200, removed, "User added to group successfully")
    )
})

export { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup };