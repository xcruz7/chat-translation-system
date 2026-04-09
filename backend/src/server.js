import http from "node:http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";

import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { registerRoomHandlers } from "./socket/registerRoomHandlers.js";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();

// 🔥 Serve frontend (dist folder)
app.use(express.static(path.join(__dirname, "../../dist")));
``
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// Create server
const server = http.createServer(app);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: env.clientUrl.split(",").map((url) => url.trim()),
    methods: ["GET", "POST"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  registerRoomHandlers(io, socket);
});

// Start server
server.listen(env.port, () => {
  console.log(
    `Lingua Flow API + Socket.IO running on port ${env.port}`
  );
});