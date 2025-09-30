const express = require("express");
const { connectDb } = require("./config/database.js");
const { User } = require("./models/user.js");

const app = express();

const port = 3000;

app.use(express.json());

// Create user/ sign up user
app.post("/signup", async (req, res) => {
  try {
    const newUser = req.body;

    const user = new User(newUser);
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

// Get user by email ID
app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const users = await User.find({ emailId: userEmail });

    if (users.length === 0) {
      res.status(404).send({
        message: "Users not found",
      });
    }
    res.status(200).send({
      data: {
        users: users,
      },
    });
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
    });
  }
});

// Get all users
app.get("/feed", async (req, res) => {
  try {
    const allUsers = await User.find({});

    if (allUsers.length === 0) {
      res.status(404).send({
        message: "No users found",
      });
    }

    res.status(200).send({
      data: {
        count: allUsers.length,
        users: allUsers,
      },
    });
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
    });
  }
});

// Get user by ID
app.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      res.status.send(404)({
        message: "No users found",
      });
    }

    res.send(user);
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
    });
  }
});

// Delete user by ID
app.delete("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const objectToDelete = await User.findByIdAndDelete(id);

    if (!objectToDelete) {
      throw Error(`There is no user with ID ${id}`);
    }
    res.status(200).send({
      message: "User deleted!",
    });
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
    });
  }
});

// Update document by ID
app.patch("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedBody = req.body;
    const user = await User.findByIdAndUpdate(id, updatedBody, { returnDocument: "after", runValidators: true });

    if (!user) {
      throw Error(`There is no user with ID ${id}`);
    }

    res.send({
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
    });
  }
});

// Update document by email
app.patch("/user/email/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const updatedBody = req.body;
    const user = await User.findOneAndUpdate({ emailId: email }, updatedBody, { returnDocument: "after" });

    if (!user) {
      throw Error(`There is no user  with ID ${id}`);
    }

    res.send({
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(404).send({
      message: "Not found",
      err: err.message,
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
