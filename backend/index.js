const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("../backend/database");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const productRoutes = require("../backend/routes/productRoutes");

app.use("/product", productRoutes);

// initialize my webscoket connection to my react app URL
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected!");

  socket.on("message", (data) => {
    console.log("Message received", data);
    io.emit("mesasge", data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

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
