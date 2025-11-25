const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const paymentSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },

    membershipType: {
      type: String,
      required: true,
    },

    sessionId: {
      type: String, // Stripe Checkout Session ID
      required: true,
      unique: true,
    },

    paymentIntentId: {
      type: String, // Stripe PaymentIntent ID
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      required: true,
      default: "inr",
    },

    status: {
      type: String, // e.g. "paid"
      required: true,
    },

    email: {
      type: String, // Customer Email
    },
  },
  { timestamps: true }
);

const Payment = model("Payment", paymentSchema);
module.exports = { Payment };
