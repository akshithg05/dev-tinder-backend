const express = require("express");
const { User } = require("../models/user");
const stripe = require("../utils/stripe");
const {
  MEMBERSHIP_PAYMENT,
  BACKEND_URL,
  LOCALHOST_URL,
  FRONTEND_URL,
  MEMBERSHIP_TYPE,
} = require("../utils/constants");
const { userAuth } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/payment/create-checkout-session", userAuth, async (req, res) => {
  try {
    const membershipType = req.body.membershipType;
    const userId = String(req?.user?._id);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${MEMBERSHIP_TYPE[membershipType]} Membership`,
            },
            unit_amount: MEMBERSHIP_PAYMENT[membershipType],
          },
          quantity: 1,
        },
      ],
      metadata: {
        membershipType,
        userId: userId,
      },
      expand: ["payment_intent"],
      success_url: `${FRONTEND_URL}/premium`,
      cancel_url: `${FRONTEND_URL}/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/payment/verify-payment", userAuth, async (req, res) => {
  try {
    const userId = req?.user?._id;

    const user = await User.findById(userId);
    const isUserPremium = user?.isPremium || false;
    const membershipType = isUserPremium ? user?.membershipType : null;

    res.status(200).json({
      isPremium: isUserPremium,
      membershipType: membershipType,
    });
  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
});

module.exports = router;
