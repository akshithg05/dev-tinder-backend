const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("Hello from the root page");
});

app.use("/test", (req, res) => {
  res.send("Hello, this is the test route!");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
