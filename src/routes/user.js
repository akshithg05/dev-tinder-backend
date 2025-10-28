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
      "photoUrl",
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
        "photoUrl",
        "age",
        "gender",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "photoUrl",
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
      count: connections.length,
      connections,
    });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      message: err?.message,
    });
  }
});

/*
My own implementation of the /feed API (unoptimized)
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req?.user;
    let invalidUsers = [loggedInUser?._id];

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: { $eq: loggedInUser?._id } },
        { fromUserId: { $eq: loggedInUser?._id } },
      ],
    });

    connectionRequest.forEach((connection) => {
      if (connection?.fromUserId?.equals(loggedInUser?._id)) {
        invalidUsers.push(connection?.toUserId);
      } else if (
        connection?.toUserId?.equals(loggedInUser?._id) &&
        connection?.status !== CONNECTION_REQUEST_STATUS.interested
      ) {
        invalidUsers.push(connection?.fromUserId);
      }
    });

    invalidUsers = [...new Set(invalidUsers)];

    const validUsers = await User.find({
      _id: { $nin: invalidUsers },
    }).select("firstName lastName about photoUrl age gender skills");

    res.status(200).send({
      data: validUsers,
    });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      message: err?.message,
    });
  }
});
*/

/*
Faster (fewer round trips and no manual filtering).
Cleaner (less logic in app code).
Scalable (handles large user and request datasets easily). */
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req?.query?.page) || 1;
    let limit = parseInt(req?.query?.limit) || 10;
    const skip = (page - 1) * limit;

    if (!limit) {
      const err = new Error("Enter valid limit");
      err.statusCode = 400;
      throw err;
    }

    if (limit > 100) {
      limit = 100;
    }

    // Step 1: Find all users you sent requests to (exclude all)
    const sentRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
    }).select("toUserId");

    // Step 2: Find all requests sent TO you where status is NOT 'interested' (exclude all)
    const receivedRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: { $ne: CONNECTION_REQUEST_STATUS.interested },
    }).select("fromUserId");

    // Step 3: Build a single array of invalid user IDs
    const invalidUsers = [
      loggedInUser._id,
      ...sentRequests.map((r) => r.toUserId),
      ...receivedRequests.map((r) => r.fromUserId),
    ];

    // Step 4: Fetch users who are not in invalid list
    const validUsers = await User.find({
      _id: { $nin: invalidUsers },
    })
      .select("firstName lastName about photoUrl age gender skills")
      .skip(skip)
      .limit(limit);

    res.status(200).send({
      count: validUsers.length,
      data: validUsers,
    });
  } catch (err) {
    res.status(err?.statusCode || 400).send({
      message: err?.message || "Failed to fetch feed",
    });
  }
});

userRouter.get("/user/:userId", userAuth, async (req, res) => {
  try {
    const userId = req?.params?.userId;
    const user = await User.findById(userId);

    if (!user){
      const err = new Error('User not found')
      err.statusCode = 404
      throw err
    }
    res.status(200).send({
      user,
    });
  } catch (err) {
    res.status(err?.statusCode || 404).send({
      message: err?.message || "Not found!",
    });
  }
});

module.exports = userRouter;
