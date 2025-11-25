const CONNECTION_REQUEST_STATUS = {
  interested: "INTERESTED",
  ignored: "IGNORED",
  accepted: "ACCEPTED",
  rejected: "REJECTED",
};

const BASE_URL = "https://dev-tidner.netlify.app/connections";

const MEMBERSHIP_PAYMENT = {
  SILVER: 30000,
  GOLD: 60000,
};

const BACKEND_URL = "https://dev-tinder-backend-r1ek.onrender.com";
const FRONTEND_URL = "https://dev-tidner.netlify.app";
const LOCALHOST_URL = "http://localhost:5173";

module.exports = {
  CONNECTION_REQUEST_STATUS,
  BASE_URL,
  MEMBERSHIP_PAYMENT,
  BACKEND_URL,
  LOCALHOST_URL,
};
