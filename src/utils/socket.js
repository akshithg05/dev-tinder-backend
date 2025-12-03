const socket = require("socket.io");
const crypto = require("crypto");

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
    socket.on("sendMessage", ({ firstName, userId, toUserId, text }) => {
      const roomId = getSecretRoomId(userId, toUserId);
      io.to(roomId).emit("messageReceived", {
        firstName,
        userId,
        toUserId,
        text,
      });
    });
    socket.on("disconnect", () => {});
  });
}

module.exports = { initializeSocket };
