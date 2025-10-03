const express = require("express");
const brcypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { connectDb } = require("./config/database.js");
const { User } = require("./models/user.js");
const {
  validateSignUpData,
  validateLoginData,
} = require("./utils/validation.js");

const app = express();

const port = 3000;

dotenv.config();
app.use(express.json());
app.use(cookieParser());

// Create user/ sign up user
app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, gender, about, skills } =
      req?.body;
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
app.post("/login", async (req, res) => {
  try {
    // Validate login data
    validateLoginData(req);

    const { emailId, password } = req?.body;
    const user = await User.findOne({ emailId: emailId });

    const isPasswordValid = await brcypt.compare(password, user?.password);

    if (isPasswordValid) {
      // Create JWT token
      const jwtToken = await jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET
      );

      // Set cookie to token
      res.cookie("token", jwtToken);

      res.status(200).send({
        message: "Logged in successfully!",
      });
    } else {
      res.status(404).send({
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    res.status(404).send({
      message: err.message,
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
    const id = req?.params?.id;
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
    const id = req?.params?.id;
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

// Delete all documents

app.delete("/feed/delete", async (req, res) => {
  try {
    await User.deleteMany();
    res.status(204).send({
      message: "All documents deleted",
    });
  } catch (err) {
    res.status(404).send({
      message: err.message,
    });
  }
});

// Update document by ID
app.patch("/user/:id", async (req, res) => {
  try {
    const id = req?.params?.id;
    const updatedBody = req.body;

    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "photoURL",
      "about",
      "skills",
    ];
    const isUpdateAllowed = Object.keys(updatedBody).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      const err = new Error(`Editable fields are ${ALLOWED_UPDATES}.`);
      err.statusCode = 403;
      throw err;
    }

    if (updatedBody?.skills?.length > 10) {
      const err = new Error("Skills cannot be more than 10");
      err.statusCode = 403;
      throw err;
    }

    const uniqueSkills = new Set(updatedBody.skills);
    if (uniqueSkills.size !== updatedBody.skills.length) {
      const err = new Error("Skills must be unique");
      err.statusCode = 403;
      throw err;
    }

    const user = await User.findByIdAndUpdate(id, updatedBody, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!user) {
      const err = new Error(`There is no user with ID ${id}`);
      err.statusCode = 404;
      throw err;
    }

    res.send({
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(err.statusCode || 500).send({
      message: err.message,
    });
  }
});

// Update document by email
app.patch("/user/email/:email", async (req, res) => {
  try {
    const email = req?.params?.email;
    const updatedBody = req.body;
    const user = await User.findOneAndUpdate({ emailId: email }, updatedBody, {
      returnDocument: "after",
    });

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

app.get("/profile", async (req, res) => {
  try {
    const { token } = req.cookies;
    const decodedValue = await jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded value: ", decodedValue);

    res.status(200).send({
      message: "Reading cookie successful",
    });
  } catch (err) {
    res.status(404).send({
      err: "Not found",
      message: err.message,
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
