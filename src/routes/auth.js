const express = require("express");
const brcypt = require("bcrypt");
const { User } = require("../models/user.js");
const {
  validateSignUpData,
  validateLoginData,
} = require("../utils/validation.js");
const { sendMail } = require("../utils/email.js");

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
      photoUrl,
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
      photoUrl,
    });
    await user.save();

    sendMail(
      emailId,
      "Welcome to DevTinder!",
      `Hi ${user?.firstName},

        Thank you for signing up on DevTinder! 🎉

        We’re excited to have you on board. Start exploring and connect with others.

        Happy swiping!,
        The DevTinder Team`
    ).catch((err) => console.error("Email failed:", err));

    res.status(201).send({
      message: "User created successfully!",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).send({
      message: err?.message,
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
        secure: true, // must be true on HTTPS (Render)
        sameSite: "none", // required for cross-site cookies
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      });

      sendMail(
        emailId,
        "Login alert on DevTinder",
        `Hi ${
          user?.firstName
        }, you have logged into DevTinder at ${new Date().toLocaleString(
          "en-IN",
          { dateStyle: "medium", timeStyle: "short" }
        )}`
      ).catch((err) => console.error("Email failed:", err));

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
