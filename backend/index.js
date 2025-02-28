const express = require("express");
const mysql = require("mysql2");
const router = express.Router();
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(201).json({ Message: "success " });
});

app.listen(port, () => {
  console.log("connected!");
});
