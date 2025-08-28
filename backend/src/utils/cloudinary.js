import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// config


const uploadOnCloudinary= async (localFilePath)=> {
    try{
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        if(!localFilePath){
            return null;
        }
        //uploading
        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response
    }
    catch{
        fs.unlinkSync(localFilePath)
        return null;
    }
}

export {
    uploadOnCloudinary
}