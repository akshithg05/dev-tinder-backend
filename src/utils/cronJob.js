const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const { ConnectionRequest } = require("../models/connectionRequest");
const { CONNECTION_REQUEST_STATUS, BASE_URL } = require("./constants");
const { sendMail } = require("./email");

// CronJob reference

//  # ┌────────────── second (optional)
//  # │ ┌──────────── minute
//  # │ │ ┌────────── hour
//  # │ │ │ ┌──────── day of month
//  # │ │ │ │ ┌────── month
//  # │ │ │ │ │ ┌──── day of week
//  # │ │ │ │ │ │
//  # │ │ │ │ │ │
//  # * * * * * *

cron.schedule("0 0 8 * * *", async () => {
  // Send email to all people who got requests the previous day
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: CONNECTION_REQUEST_STATUS.interested,
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId", ["firstName", "emailId"]);

    let listOfEmailsToSend = pendingRequests?.map((request) => {
      return request?.toUserId?.emailId;
    });

    let emailCountMap = {};

    for (let i = 0; i < listOfEmailsToSend.length; i++) {
      if (emailCountMap[listOfEmailsToSend[i]]) {
        emailCountMap[listOfEmailsToSend[i]]++;
      } else {
        emailCountMap[listOfEmailsToSend[i]] = 1;
      }
    }
    console.log(emailCountMap);
    listOfEmailsToSend = [...new Set(listOfEmailsToSend)];
    console.log(listOfEmailsToSend);

    listOfEmailsToSend.forEach((email) => {
      const loginUrl = BASE_URL;

      const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Hi,</p>
      <p>You have <strong>${emailCountMap[email]}</strong> connection requests!</p>
      <p>Login right now and check who liked your profile.</p>
      <a
        href="${loginUrl}"
        style="
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          padding: 10px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 10px;
        "
      >
        Click here to Login
      </a>
    </div>
  `;

      sendMail(email, "Your Daily Connections Update!", htmlContent).catch(
        (err) => console.error("Email failed:", err)
      );
    });
  } catch (err) {
    console.log(err);
  }
});
