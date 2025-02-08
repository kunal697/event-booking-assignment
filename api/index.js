const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const http = require("http");
const WebSocket = require("ws");

const UserModel = require("./models/User");
const Ticket = require("./models/Ticket");
const Event = require("./models/Event");

// Routes
const eventRoutes = require("./routes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const server = http.createServer(app); // Create HTTP server

const bcryptSalt = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "https://event-mang.netlify.app", // Your frontend URL
  credentials: true, // Allow cookies & credentials
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// WebSocket Server
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("close", () => {
    console.log("WebSocket disconnected");
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Serverless
module.exports = app;
