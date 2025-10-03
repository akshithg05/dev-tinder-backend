const mongoose = require("mongoose");

async function connectDb() {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
}

module.exports = { connectDb };
