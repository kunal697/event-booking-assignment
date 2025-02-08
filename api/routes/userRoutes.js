const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const Event = require('../models/Event');

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const bcryptSalt = bcrypt.genSaltSync(10);

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
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ error: "Wrong password" });
    }

    jwt.sign({
      email: userDoc.email,
      id: userDoc._id,
      name: userDoc.name
    }, JWT_SECRET, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Something went wrong" });
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

// Get user's events with details
router.get('/events', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id })
      .populate('attendees', 'name email')
      .populate('owner', 'name email')
      .sort('-createdAt');

    // Get additional stats for each event
    const eventsWithStats = await Promise.all(events.map(async (event) => {
      const pastEvent = new Date(event.eventDate) < new Date();
      
      return {
        ...event.toObject(),
        stats: {
          totalAttendees: event.attendees.length,
          isFull: event.currentAttendees >= event.maxAttendees,
          spotsLeft: event.maxAttendees - event.currentAttendees,
          status: pastEvent ? 'completed' : 'upcoming'
        }
      };
    }));

    // Group events by status
    const groupedEvents = {
      upcoming: eventsWithStats.filter(event => event.stats.status === 'upcoming'),
      completed: eventsWithStats.filter(event => event.stats.status === 'completed')
    };

    res.json({
      events: eventsWithStats,
      grouped: groupedEvents,
      stats: {
        total: events.length,
        upcoming: groupedEvents.upcoming.length,
        completed: groupedEvents.completed.length,
        totalAttendees: eventsWithStats.reduce((sum, event) => sum + event.attendees.length, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
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