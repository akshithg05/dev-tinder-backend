const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

async function userAuth(req, res, next) {
  try {
    const cookie = req.cookies;
    const { token } = cookie;

    if (!token) {
      let err = new Error("Invalid Token or user not signed in");
      err.statusCode = 401;
      throw err;
    }

    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedData;

    const user = await User.findById(_id);
    if (!user) {
      let err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Attach user to request headers
    req.user = user;
    next();
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
}

async function checkUserRole(req, res, next) {
  try {
    let userRole = req?.user?.role;
    if (userRole !== "ADMIN") {
      let err = new Error("Unauthorized action");
      err.statusCode = 401;
      throw err;
    }
    next();
  } catch (err) {
    res.status(err?.statusCode || 500).send({
      message: err?.message,
    });
  }
}

module.exports = { userAuth, checkUserRole };
