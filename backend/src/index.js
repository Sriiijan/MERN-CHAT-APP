import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config({
    path: './env'
});

const port = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR", error);
            throw error;
        });

        // Create HTTP server from Express app
        const server = http.createServer(app);

        // Initialize Socket.IO with the HTTP server
        const io = new Server(server, {
            pingTimeout: 60000,
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        // Socket.IO connection handling
        io.on("connection", (socket) => {
            console.log("✅ Client connected:", socket.id);
            
            socket.on("disconnect", () => {
                console.log("❌ Client disconnected:", socket.id);
            });
            
            // Add other socket event handlers here
            socket.on("setup", (userData) => {
                socket.join(userData._id);
                socket.emit("connected");
            });

            socket.on("join chat", (room) => {
                socket.join(room);
                console.log("User Joined Room: ", room)
            })

            socket.on("typing", (room) => socket.in(room).emit("typing"))
            socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

            socket.on("new message", (newMessageReceived) => {
                var chat= newMessageReceived.chat;

                if(!chat.users) return console.log("Chat.users not defined")

                chat.users.forEach((user) => {
                    if(user._id == newMessageReceived.sender._id) return;
                    socket.in(user._id).emit("message recieved", newMessageReceived);
                });
            });

            socket.off("set up", () => {
                console.log("USER DISCONNECTED");
                socket.leave(userData._id);
            });
        });

        // Start the server
        server.listen(port, () => {
            console.log(`⚙️  Server is running at port: ${port}`);
        });
    })
    .catch((error) => {
        console.log(`MONGO connection failed !!! `, error);
    });