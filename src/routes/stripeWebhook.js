const express = require("express");
const router = express.Router();
const stripe = require("../utils/stripe");
const { User } = require("../models/user");
const { Payment } = require("../models/payment");

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

    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const membershipType = session.metadata.membershipType;

      console.log("Payment successful for user:", userId, membershipType);

      //Update user premium details
      const user = await User.findById(userId);
      if (user) {
        user.isPremium = true;
        user.membershipType = membershipType;
        user.premiumSince = new Date();
        await user.save();
      }

      //Save payment in DB
      await Payment.create({
        userId,
        membershipType,
        sessionId: session.id,
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        email: session.customer_details?.email || null,
      });

      console.log("Payment saved in DB");
    }

    res.json({ received: true });
  }
);

module.exports = router;
