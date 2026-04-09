import http from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { registerRoomHandlers } from "./socket/registerRoomHandlers.js";

const app = createApp();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: env.clientUrl.split(",").map((url) => url.trim()),
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  registerRoomHandlers(io, socket);
});

server.listen(env.port, () => {
  console.log(`Lingua Flow API + Socket.IO running on http://localhost:${env.port}`);
});
