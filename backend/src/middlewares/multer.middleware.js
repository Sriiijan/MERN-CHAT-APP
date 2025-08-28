import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { // cb: call back
        cb(null, "./backend/public/temp") // destination folder
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
  
export const upload = multer({
    storage
})