const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, toUserId].sort().join("_"))
    .digest("hex");
};

function initializeSocket(server) {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dev-tidner.netlify.app"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      // We need to create a room with a unique Id now
      const room = getSecretRoomId(userId, toUserId);
      console.log(`${firstName} joined room ${room}`);
      socket.join(room);
    });
    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, toUserId);

        // Need to save chats here

        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }

        chat.messages.push({ senderId: userId, text: text });

        await chat.save();
        io.to(roomId).emit("messageReceived", {
          firstName,
          userId,
          toUserId,
          text,
          timestamp: new Date(),
        });
      } catch (err) {
        console.log(err);
      }
    });
    socket.on("disconnect", () => {});
  });
}

module.exports = { initializeSocket };
