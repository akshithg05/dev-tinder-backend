const validator = require("validator");

function validateSignUpData(req) {
  const { firstName, lastName, emailId, password } = req?.body || {};

  if (!firstName || !lastName) {
    const err = new Error("First name and last name are required");
    err.statusCode = 400;
    throw err;
  }

  if (firstName.length < 2 || lastName.length < 2) {
    const err = new Error("The length of the name should be greater than 2");
    err.statusCode = 400;
    throw err;
  }

  if (!validator.isEmail(emailId)) {
    const err = new Error("Please enter a valid email ID");
    err.statusCode = 400;
    throw err;
  }

  if (!validator.isStrongPassword(password)) {
    const err = new Error("Please enter a stronger password");
    err.statusCode = 400;
    throw err;
  }

  return true;
}

function validateLoginData(req) {
  const { emailId, password } = req?.body;
  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid credentials");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Invalid credentials");
  }
  return true;
}

module.exports = { validateSignUpData, validateLoginData };
