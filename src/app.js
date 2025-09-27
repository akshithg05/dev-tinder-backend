const express = require("express");
const { connectDb } = require("./config/database.js");
const { User } = require("./models/user.js");

const app = express();

const port = 3000;

app.post("/signup", (req, res) => {
  try {
    const userObj = {
      firstName: "Akshith",
      lastName: "Gunasheelan",
      age: 25,
      gender: "male",
    };

    const user = new User(userObj);
    user.save();

    res.status(201).send({
      message: "User created successfully!",
    });
  } catch (err) {
    res.status(400).send({
      message: "Something went wrong!",
      err: err?.message,
    });
  }
});

connectDb()
  .then(() => {
    console.log("DB Connection successful");
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Something went wrong!");
    console.error(err);
  });
