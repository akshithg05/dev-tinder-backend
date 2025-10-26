const validator = require("validator");
const bcrypt = require("bcrypt");

function validateSignUpData(req) {
  const { firstName, lastName, emailId, password, age } = req?.body || {};

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

  if (!age) {
    const err = new Error("Age is required");
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
    const err = new Error("Invalid credentials !");
    err.statusCode = 400;
    throw err;
  } else if (!validator.isStrongPassword(password)) {
    const err = new Error("Invalid credentials !");
    err.statusCode = 400;
    throw err;
  }
  return true;
}

function validateEditableData(data) {
  const editableFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "about",
    "photoUrl",
    "skills",
  ];

  const inValidKeys = [];
  Object.keys(data).forEach((key) => {
    if (!editableFields.includes(key)) {
      inValidKeys.push(key);
    }
  });

  if (inValidKeys.length > 0) {
    const err = new Error(`${inValidKeys} not editable`);
    err.statusCode = 401;
    throw err;
  }

  if (
    Object.keys(data).includes("photoUrl") &&
    !validator.isURL(data.photoUrl)
  ) {
    const err = new Error(`Invalid URL`);
    err.statusCode = 404;
    throw err;
  }
  return true;
}

async function validateNewPassword(data, user) {
  const validFields = ["currentPassword", "newPassword"];
  const dataKeys = Object.keys(data);

  const allKeysAreValid = dataKeys.every((key) => validFields.includes(key));

  const hasCorrectNumberOfFields = dataKeys.length === validFields.length;

  if (!allKeysAreValid || !hasCorrectNumberOfFields) {
    const err = new Error(
      `Please provide exactly these valid fields: ${validFields.join(", ")}`
    );
    err.statusCode = 404;
    throw err;
  }

  const { currentPassword, newPassword } = data;
  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  const isNewPasswordValid = validator.isStrongPassword(newPassword);

  // Current password validity check
  if (!isCurrentPasswordValid) {
    const err = new Error(
      "Password incorrect, please enter valid current password"
    );
    err.statusCode = 401;
    throw err;
  }

  // New password validity check
  if (!isNewPasswordValid) {
    const err = new Error(
      "Your password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol."
    );
    err.statusCode = 401;
    throw err;
  }

  // New password same as old password
  if (currentPassword === newPassword) {
    const err = new Error(
      "New password cannot be same as the current password"
    );
    err.statusCode = 401;
    throw err;
  }

  return true;
}

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateEditableData,
  validateNewPassword,
};
