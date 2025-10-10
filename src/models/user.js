const mongoose = require("mongoose");
const validator = require("validator");
const brcypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 50,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return validator.isEmail(value);
        },
        message: "Please enter valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value);
        },
        message: "Enter stronger password, your password is too weak",
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 120,
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender`,
      },
    },
    about: {
      type: String,
      default: "This is the default about me of the user.",
      maxLength: 1000,
    },
    photoURL: {
      type: String,
      deafult:
        "https://www.vhv.rs/dpng/d/256-2569650_men-profile-icon-png-image-free-download-searchpng.png",
      validate: {
        validator: function (value) {
          return validator.isURL(value);
        },
        message: "Please enter proper photo URL",
      },
    },
    skills: {
      type: [String],
      maxLength: 10,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWTToken = async function () {
  const token = await jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.verifyPassword = async function (password) {
  const plainTextPasswordByUser = password;
  const hashedPassword = this.password;
  return await brcypt.compare(plainTextPasswordByUser, hashedPassword); // Keep this order same always, first arg - plaintext password, arg 2 - hashed password
};

const User = model("User", userSchema);

module.exports = { User };
