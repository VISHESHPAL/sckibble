import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import roomRoutes from "./routes/room.route.js";
import { socketHandler } from "./sockets/socket.handler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials : true
}));

app.use(express.json());

// Routes
app.use("/api/rooms", roomRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// Socket connection
io.on("connection", (socket) => {
  socketHandler(io, socket);
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server running on the PORT ${PORT}`);
});