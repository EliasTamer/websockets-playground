const express = require("express");
require("../backend/database");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const productRoutes = require("../backend/routes/productRoutes");

app.use("/product", productRoutes);

// to handle the thrown errors in my controllers
app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({
      message: message,
      data: data,
  });
});

app.listen(process.env.PORT, () => {
  console.log("server is running!");
});
