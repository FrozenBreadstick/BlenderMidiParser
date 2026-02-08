const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/upload", (req, res) => {
  res.send("Uploaded Successfully");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
