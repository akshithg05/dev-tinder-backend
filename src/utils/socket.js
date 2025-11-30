const http = require("http");
const socket = require("socket.io");

function initializeSocket(server) {
  const io = socket(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dev-tidner.netlify.app"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", () => {});
    socket.on("sendMessage", () => {});
    socket.on("disconnect", () => {});
  });
}

module.exports = { initializeSocket };
