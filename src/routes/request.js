const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");

const requestRouter = express.Router();

requestRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    console.log("Sending connection Request");
  } catch (err) {}
});

module.exports = requestRouter;
