const express = require("express");
const {
  validateSignUpData,
  validateLoginData,
} = require("../utils/validation.js");
const { User } = require("../models/user.js");
const brcypt = require("bcrypt");

const authRouter = express.Router();

// Create user/ sign up user
authRouter.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      password,
      gender,
      about,
      skills,
      role,
      age,
    } = req?.body;
    // Validte the data
    validateSignUpData(req);

    // Encrypt passowrd
    const passwordHash = await brcypt.hash(password, 10);

    // Save user
    const user = new User({
      firstName,
      lastName,
      emailId,
      gender,
      about,
      skills,
      password: passwordHash,
      role,
      age,
    });
    await user.save();

    res.status(201).send({
      message: "User created successfully!",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).send({
      message: "Something went wrong!",
      err: err?.message,
    });
  }
});

// Login user
authRouter.post("/login", async (req, res) => {
  try {
    // Validate login data
    validateLoginData(req);

    const { emailId, password } = req?.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      let err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    const isPasswordValid = await user.verifyPassword(password);

    if (isPasswordValid) {
      // Create JWT token
      const jwtToken = await user.getJWTToken();

      // Set cookie to token
      res.cookie("token", jwtToken, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });

      res.status(200).send({
        message: "Logged in successfully!",
        loggedInUser: user,
      });
    } else {
      res.status(404).send({
        message: "Invalid credentials!",
      });
    }
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send({
      message: "Logged out successfully!",
    });
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
});

module.exports = authRouter;
