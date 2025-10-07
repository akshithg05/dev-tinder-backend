const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware.js");

const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res) => {
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

module.exports = profileRouter;
