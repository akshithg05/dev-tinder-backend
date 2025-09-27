const mongoose = require("mongoose");

const connectionString = "mongodb+srv://akshithg01:yXoaqg2W6qKWHgPI@cluster0.vgg8sag.mongodb.net/devTinder";

async function connectDb() {
  await mongoose.connect(connectionString);
}

module.exports = { connectDb };
