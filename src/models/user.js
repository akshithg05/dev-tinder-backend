const mongoose = require("mongoose");
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
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 16,
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
      },
    },
    about: {
      type: String,
      default: "This is the default about me of the user.",
      maxLength: 1000,
    },
    photoURL: {
      type: String,
      deafult: "https://www.vhv.rs/dpng/d/256-2569650_men-profile-icon-png-image-free-download-searchpng.png",
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

const User = model("User", userSchema);

module.exports = { User };
