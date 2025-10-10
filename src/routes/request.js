const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { User } = require("../models/user");
const { ConnectionRequest } = require("../models/connectionRequest");
const { CONNECTION_REQUEST_STATUS } = require("../utils/constants");

const requestRouter = express.Router();

requestRouter.post(
  "/sendConnectionRequest/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req?.user?._id;
      const toUserId = req?.params?.toUserId;
      const status =
        CONNECTION_REQUEST_STATUS[req?.params?.status] || req?.params?.status;

      // Check if toUserId exists
      const isUserIdValid = await User.findById(toUserId);
      if (!isUserIdValid) {
        const err = new Error("User does not exist");
        err.statusCode = 404;
        throw err;
      }

      // Check if from and to user is the same (this logic can be added as pre save hook as well)
      // if (toUserId == fromUserId) {
      //   const err = new Error("From and to user ID cannot be the same");
      //   err.statusCode = 409;
      //   throw err;
      // }

      // Check if the status is allowed
      const allowedStatus = ["INTERESTED", "IGNORED"];
      if (!allowedStatus.includes(status)) {
        const err = new Error(`Invalid status type: ${status}`);
        err.statusCode = 400;
        throw err;
      }

      // Check if connection request already exists between users
      const isConnectionRequestPresent = await ConnectionRequest.find({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isConnectionRequestPresent.length > 0) {
        const err = new Error("Connection request already exists!");
        err.statusCode = 409;
        throw err;
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.status(201).send({
        message: `Connection request ${req?.params?.status || "sent "}`,
        data,
      });
    } catch (err) {
      res.status(err?.statusCode || 404).send({
        message: err?.message,
      });
    }
  }
);

module.exports = requestRouter;
