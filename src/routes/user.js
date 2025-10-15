const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { ConnectionRequest } = require("../models/connectionRequest");
const { CONNECTION_REQUEST_STATUS } = require("../utils/constants");
const { User } = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/requests/pending", userAuth, async (req, res) => {
  try {
    const loggedInUser = req?.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser?._id,
      status: CONNECTION_REQUEST_STATUS.interested,
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "about",
      "photoURL",
      "age",
      "gender",
    ]);

    res.status(200).send({
      count: connectionRequests.length,
      pendingRequests: connectionRequests,
    });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      message: err?.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req?.user;

    const acceptedConnectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser?._id }, { fromUserId: loggedInUser?._id }],
      status: CONNECTION_REQUEST_STATUS?.accepted,
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "photoURL",
        "age",
        "gender",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "photoURL",
        "age",
        "gender",
      ]);

    // Need to send the userId of the connection, not myseld
    const connections = acceptedConnectionRequests?.map((row) => {
      if (row.fromUserId.equals(loggedInUser?._id)) {
        return row?.toUserId;
      } else {
        return row?.fromUserId;
      }
    });

    res.status(200).send({
      data: {
        connections,
      },
    });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      message: err?.message,
    });
  }
});

module.exports = userRouter;
