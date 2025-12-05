const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { Chat } = require("../models/chat");

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
  try {
    const userId = req?.user?._id;
    const toUserId = req?.params?.toUserId;
    const chats = await Chat.findOne({
      participants: { $all: [userId, toUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chats) {
      return res.status(200).send({
        data: [],
      });
    }

    res.status(200).send({
      data: chats,
    });
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

module.exports = chatRouter;
