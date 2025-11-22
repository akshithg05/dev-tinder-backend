const express = require("express");
const { userAuth } = require("../middlewares/authMiddleware");
const { Payment } = require("../models/payment");

const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: 70000,
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
    res.status(200).send({ ...savedPayment.toJSON() });
  } catch (err) {
    res.status(404).send({
      message: err?.message,
    });
  }
});

module.exports = paymentRouter;
