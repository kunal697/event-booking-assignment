const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');

const UserModel = require("./models/User");
const Ticket = require("./models/Ticket");
const Event = require('./models/Event');

// Routes
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server

const bcryptSalt = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

app.use(cors({
  credentials: true,
  origin: ['https://event-mang.netlify.app/', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(cookieParser());
app.use(express.json());

// MongoDB Connection with Error Handling
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(4000, () => {
      console.log('Server is running on port 4000');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });


// WebSocket Server

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ error: "Wrong password" });
    }

    const tokenPayload = { email: userDoc.email, id: userDoc._id, name: userDoc.name };

    jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) {
        console.error('JWT Sign error:', err);
        return res.status(500).json({ error: "Failed to generate token" });
      }

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      }).json({ id: userDoc._id, email: userDoc.email, name: userDoc.name });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
      if (err) return res.status(403).json({ error: "Unauthorized" });
      const { name, email, _id } = await UserModel.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.status(401).json({ error: "No token provided" });
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post("/tickets", async (req, res) => {
  try {
    const ticketDetails = req.body;
    const newTicket = new Ticket(ticketDetails);
    await newTicket.save();
    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/tickets/user/:userId", async (req, res) => {
  try {
    const tickets = await Ticket.find({ userid: req.params.userId });
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    res.status(500).json({ error: "Failed to fetch user tickets" });
  }
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start HTTP and WebSocket server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Serverless Deployment (e.g., AWS Lambda)
module.exports = app;
