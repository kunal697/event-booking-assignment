const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');
// Get user's events with details
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); 

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const bcryptSalt = bcrypt.genSaltSync(10);

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



// Register - POST /api/users/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

// Login - POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passOk = bcrypt.compareSync(password, user.password);
    if (!passOk) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    const token = jwt.sign({ 
      id: user._id,
      email: user.email 
    }, process.env.JWT_SECRET);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // Enable for HTTPS
      sameSite: 'none', // Important for cross-site cookies
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      id: user._id,
      email: user.email,
      name: user.name
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get profile - GET /api/users/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const { name, email, _id } = await User.findById(req.user.id);
    res.json({ name, email, _id });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Logout - POST /api/users/logout
router.post("/logout", (req, res) => {
  res.cookie('token', '').json(true);
});



router.post("/", auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      eventTime,
      location,
      maxAttendees
    } = req.body;

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream({ folder: 'events' }, (error, result) => {
        if (error) throw error;
        return result.secure_url;
      }).end(req.file.buffer);
      imageUrl = result;
    }

    const event = new Event({
      title,
      description,
      category,
      eventDate,
      eventTime,
      location,
      maxAttendees: parseInt(maxAttendees),
      owner: req.user.id,
      image: imageUrl
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});


// Get event details for a specific user event
router.get('/events/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      owner: req.user._id
    })
    .populate('attendees', 'name email joinedAt')
    .populate('owner', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get detailed stats
    const pastEvent = new Date(event.eventDate) < new Date();
    const eventWithStats = {
      ...event.toObject(),
      stats: {
        totalAttendees: event.attendees.length,
        isFull: event.currentAttendees >= event.maxAttendees,
        spotsLeft: event.maxAttendees - event.currentAttendees,
        status: pastEvent ? 'completed' : 'upcoming',
        attendeeStats: {
          total: event.attendees.length,
          recentJoins: event.attendees.filter(
            a => new Date(a.joinedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length
        }
      }
    };

    res.json(eventWithStats);

  } catch (error) {
    console.error('Error fetching event details:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Get summary of user's event activity
router.get('/events/summary', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id });
    const now = new Date();

    const summary = {
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.eventDate) > now).length,
      pastEvents: events.filter(e => new Date(e.eventDate) <= now).length,
      totalAttendees: events.reduce((sum, event) => sum + event.attendees.length, 0),
      averageAttendees: events.length 
        ? Math.round(events.reduce((sum, event) => sum + event.attendees.length, 0) / events.length) 
        : 0,
      mostPopularCategory: events.length 
        ? Object.entries(
            events.reduce((acc, event) => {
              acc[event.category] = (acc[event.category] || 0) + 1;
              return acc;
            }, {})
          ).sort((a, b) => b[1] - a[1])[0][0]
        : null
    };

    res.json(summary);

  } catch (error) {
    console.error('Error fetching event summary:', error);
    res.status(500).json({ error: 'Failed to fetch event summary' });
  }
});

module.exports = router; 
