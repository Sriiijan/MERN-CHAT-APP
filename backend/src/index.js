import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

const port= (process.env.PORT || 5000)

connectDB().then(()=>{
    app.on("error", (error)=>{
        console.log("ERROR", error);
        throw error;
    })

    app.listen(port, ()=>{
        console.log(`⚙️  Server is running at port: ${port}`)
    })
}).then().catch((error)=>{
    console.log(`MONGO connection failed !!! `, err)
})