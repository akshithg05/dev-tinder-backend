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
paymentRouter.post("/payment/webook", async (req, res) => {
  try {
    const webhookSignature = req.headers["X-Razorpay-Signature"];
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RZP_WEBHOOK_SECRET
    );

    // In the case of inValid webook
    if (!isWebhookValid) {
      res.status(403).send({
        message: "Invalid webook",
      });
    }

    // If webhook is valid
    // Update my payment status in DB

    const paymentDetails = req?.body?.payload?.payment?.entity;
    const payment = await Payment.findOne({
      orderId: paymentDetails?.order_id,
    });
    payment.status = paymentDetails?.status;
    await payment.save();

    // Update the user as premium

    const user = await User.findOne({ _id: payment?.userId });
    user.isPremium = true;
    user.membershipType = payment?.notes?.membershipType;
    await user.save();

    // return success response to razorpay

    // if (req.body.event === "payment.captured") {
    // }

    // if (req.body.event === "payment.failed") {
    // }

    res.status(200).json({
      message: "Webhook recieved successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: err?.message,
    });
  }
});

module.exports = paymentRouter;
