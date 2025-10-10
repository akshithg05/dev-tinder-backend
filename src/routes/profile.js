const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware.js");
const bcrypt = require("bcrypt");
const {
  validateEditableData,
  validateNewPassword,
} = require("../utils/validation.js");
const { User } = require("../models/user.js");

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req?.user;
    res.status(200).send({
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const isDataEditable = validateEditableData(req?.body);

    if (isDataEditable) {
      const { id } = req?.user;
      const newUserData = await User.findByIdAndUpdate(id, req?.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).send({
        message: "Data was updated successfully",
        data: {
          user: newUserData,
        },
      });
    }
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

profileRouter.patch("/profile/resetPassword", userAuth, async (req, res) => {
  try {
    await validateNewPassword(req?.body, req?.user);
    const hashedPassword = await bcrypt.hash(req?.body?.newPassword, 10);
    await User.findByIdAndUpdate(
      req?.user?.id,
      {
        password: hashedPassword,
      },
      {
        runValidators: true,
      }
    );
    res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

module.exports = profileRouter;
