const express = require("express");
const router = express.Router();
const stripe = require("../utils/stripe");
const { User } = require("../models/user");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook Signature Verification Failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const membershipType = session.metadata.membershipType;

      console.log("Payment successful for user:", userId, membershipType);

      // TODO:
      const user = await User.findById(userId);

      if (user) {
        user.isPremium = true;
        user.membershipType = membershipType;
        user.premiumSince = new Date();
        await user.save();
      }

      // 2. Save payment in Payments collection
    }

    res.json({ received: true });
  }
);

module.exports = router;
