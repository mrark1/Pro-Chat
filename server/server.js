import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

const onlineUsers = {};

// ==========================
// Health Route
// ==========================

app.get("/", (req, res) => {
  res.json({
    message: "🚀 ProChat Backend Running",
  });
});

// ==========================
// Socket Connection
// ==========================

io.on("connection", (socket) => {
  console.log("✅ Connected:", socket.id);

  // ==========================
  // JOIN ROOM
  // ==========================

  socket.on("join_room", ({ room, username }) => {
    socket.join(room);

    socket.room = room;
    socket.username = username;

    onlineUsers[socket.id] = {
      username,
      room,
    };

    // Join Notification
    io.to(room).emit("receive_message", {
      username: "System",
      text: `${username} joined the room 🎉`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      system: true,
    });

    // Online Users
    const users = Object.values(onlineUsers)
      .filter((user) => user.room === room)
      .map((user) => user.username);

    io.to(room).emit("online_users", users);

    console.log(`${username} joined ${room}`);
  });

  // ==========================
  // SEND MESSAGE
  // ==========================

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  // ==========================
  // TYPING
  // ==========================

  socket.on("typing", ({ room, username }) => {
    socket.to(room).emit("user_typing", username);
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("user_stop_typing");
  });

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", () => {
    const room = socket.room;
    const username = socket.username;

    // Remove user
    delete onlineUsers[socket.id];

    // Leave Notification
    if (room && username) {
      io.to(room).emit("receive_message", {
        username: "System",
        text: `${username} left the room 👋`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        system: true,
      });

      // Update Online Users
      const users = Object.values(onlineUsers)
        .filter((user) => user.room === room)
        .map((user) => user.username);

      io.to(room).emit("online_users", users);
    }

    console.log("❌ Disconnected:", socket.id);
  });
});

// ==========================
// Start Server
// ==========================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});