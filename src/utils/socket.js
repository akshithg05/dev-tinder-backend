const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const { ConnectionRequest } = require("../models/connectionRequest");
const { CONNECTION_REQUEST_STATUS } = require("./constants");

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
    socket.on("joinChat", ({ firstName, lastName, userId, toUserId }) => {
      // We need to create a room with a unique Id now
      const room = getSecretRoomId(userId, toUserId);
      console.log(`${firstName} joined room ${room}`);
      socket.join(room);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, userId, toUserId, text, lastName }) => {
        try {
          const roomId = getSecretRoomId(userId, toUserId);

          const areConnected = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: toUserId },
              { fromUserId: toUserId, toUserId: userId },
            ],
            status: CONNECTION_REQUEST_STATUS.accepted,
          });

          if (!areConnected) {
            socket.emit("chatError", {
              message: "You are not connected with this user",
            });
            return;
          }

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
            lastName,
            userId,
            toUserId,
            text,
            timestamp: new Date(),
          });
        } catch (err) {
          console.log(err);
        }
      }
    );
    socket.on("disconnect", () => {});
  });
}

module.exports = { initializeSocket };
