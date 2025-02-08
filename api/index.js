const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const userRoutes = require('./routes/userRoutes');

const Ticket = require("./models/Ticket");
const Event = require('./models/Event');

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:5173",
   })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(4000, () => {
      console.log('Server is running on port 4000');
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'uploads/');
   },
   filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
   }
});

const fileFilter = (req, file, cb) => {
   const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
   if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
   } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
   }
};

const upload = multer({
   storage: storage,
   fileFilter: fileFilter,
   limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
   }
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

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

      // Create token payload
      const tokenPayload = {
         email: userDoc.email,
         id: userDoc._id,
         name: userDoc.name
      };

      // Sign token
      jwt.sign(
         tokenPayload,
         JWT_SECRET,
         { expiresIn: '7d' }, // Token expires in 7 days
         (err, token) => {
            if (err) {
               console.error('JWT Sign error:', err);
               return res.status(500).json({ error: "Failed to generate token" });
            }
            
            // Set cookie and return user data
            res.cookie("token", token, {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'lax',
               maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            }).json({
               id: userDoc._id,
               email: userDoc.email,
               name: userDoc.name
            });
         }
      );
   } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Something went wrong" });
   }
});

app.get("/profile", (req, res) => {
   const { token } = req.cookies;
   if (token) {
      jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
         if (err) throw err;
         const { name, email, _id } = await UserModel.findById(userData.id);
         res.json({ name, email, _id });
      });
   } else {
      res.json(null);
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

app.get("/tickets/:id", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

app.get("/tickets/user/:userId", (req, res) => {
   const userId = req.params.userId;

   Ticket.find({ userid: userId })
      .then((tickets) => {
         res.json(tickets);
      })
      .catch((error) => {
         console.error("Error fetching user tickets:", error);
         res.status(500).json({ error: "Failed to fetch user tickets" });
      });
});

app.delete("/tickets/:id", async (req, res) => {
   try {
      const ticketId = req.params.id;
      await Ticket.findByIdAndDelete(ticketId);
      res.status(204).send();
   } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
   }
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});
