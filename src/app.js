const express = require("express");
const { connectDb } = require("./config/database.js");

const app = express();

const port = 3000;

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
