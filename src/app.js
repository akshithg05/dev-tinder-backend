const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { connectDb } = require("./config/database.js");
const { User } = require("./models/user.js");
const authRouter = require("./routes/auth.js");
const profileRouter = require("./routes/profile.js");
const requestRouter = require("./routes/request.js");

const app = express();
dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

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
