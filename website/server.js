//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const port = 3000;
const app = express()
app.use(bodyParser.urlencoded({extended: true})); // data from html form
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (req, res) {
  var x = req.body;
  console.log(x);
  res.send("Thanks for posting that wow");
});

app.listen(port, function () {
  console.log("Server started on port " + port);
});
