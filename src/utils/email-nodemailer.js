const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

async function sendMail(to, subject, content) {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      text: content,
    });
    console.log("Email sent: ", info.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

module.exports = { sendMail };
