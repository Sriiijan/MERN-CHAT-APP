import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary= async (localFilePath)=> {
    try{
        if(!localFilePath){
            return null;
        }
        //uploading
        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
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