const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { Payment } = require("../models/payment");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { MEMBERSHIP_PAYMENT } = require("../utils/constants");
const { User } = require("../models/user");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    console.log(MEMBERSHIP_PAYMENT[membershipType]);

    const order = await razorpayInstance.orders.create({
      amount: MEMBERSHIP_PAYMENT[membershipType],
      currency: "INR",
      receipt: "receipt#1",
      // Under notes we can pass in whatever we want to as metadata
      notes: {
        firstName: firstName,
        lastName: lastName,
        emailId: emailId,
        membershipType: membershipType,
      },
    });

    // Save order in DB
    const payment = new Payment({
      orderId: order.id,
      status: order.status,
      userId: req.user._id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // return order details to frontend
    res
      .status(200)
      .send({ ...savedPayment.toJSON(), keyId: process.env.RZP_API_KEY });
  } catch (err) {
    res.status(404).send({
      message: err?.message,
    });
  }
});

// We do not need userAuth here as razorpay is going to call this API.
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    const body = req.body.toString();

    const isWebhookValid = validateWebhookSignature(
      body,
      webhookSignature,
      process.env.RZP_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(403).send({
        message: "Invalid webhook signature",
      });
    }

    const paymentDetails = JSON.parse(body).payload.payment.entity;

    const payment = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      return res.status(404).send({ message: "Payment not found" });
    }

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findById(payment.userId);
    if (user) {
      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;
      await user.save();
    }

    return res.status(200).json({
      message: "Webhook received successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = paymentRouter;
