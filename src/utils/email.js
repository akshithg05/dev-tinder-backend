// email.js
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail(to, subject, content) {
  try {
    const info = await resend.emails.send({
      from: "DevTinder <onboarding@resend.dev>", // or your verified sender
      to,
      subject,
      text: content, // plain text message
    });
    console.log("✅ Email sent:", info);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}

module.exports = { sendMail };
