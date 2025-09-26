function adminAuth(req, res, next) {
  let token = "xyz";
  if (token === "xyz") {
    next();
  } else {
    res.status(401).send("Token does not match");
  }
}

function userAuth(req, res, next) {
  let token = "yz";
  if (token === "xyz") {
    next();
  } else {
    res.status(401).send("Token does not match");
  }
}

module.exports = { adminAuth, userAuth };
