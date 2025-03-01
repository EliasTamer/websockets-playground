const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("../backend/database");

const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
const httpServer = createServer(app);

const productRoutes = require("../backend/routes/productRoutes");

app.use("/product", productRoutes);

// creating web socket server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//websocket init logic + emitting and receiving signals
io.on("connection", (socket) => {
  console.log("A user connected!");

  socket.on("message", (data) => {
    console.log("Message received", data);
    io.emit("message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
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

// Use httpServer.listen instead of app.listen
httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}!`);
});
