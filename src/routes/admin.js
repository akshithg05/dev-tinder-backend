const express = require("express");
const { userAuth, checkUserRole } = require("../middlewares/authMiddleware");
const { User } = require("../models/user");

const adminRouter = express.Router();

adminRouter.get("/users", userAuth, checkUserRole, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({
      count: users.length,
      users: users,
    });
  } catch (err) {
    res.status(err?.statusCode || 404).send({
      message: "Not found",
    });
  }
});

adminRouter.patch("/users/:id", userAuth, checkUserRole, async (req, res) => {
  try {
    const userId = req.params.id;

    const data = req.body;
    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
    });

    res.status(200).send({
      message: "User updated",
      user: updatedUser,
    });
  } catch (err) {
    res.status(err?.statusCode || 404).send({
      message: err?.message,
    });
  }
});

module.exports = adminRouter;
