const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = '-createdAt' } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    if (sort === 'date') {
      sortOption = { eventDate: 1 };
    } else if (sort === '-date') {
      sortOption = { eventDate: -1 };
    } else {
      sortOption = { [sort]: -1 };
    }

    const events = await Event.find(query)
      .populate('owner', 'name')
      .sort(sortOption);

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('owner', 'name')
      .populate('attendees', 'name email');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event
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

    const event = new Event({
      title,
      description,
      category,
      eventDate,
      eventTime,
      location,
      maxAttendees: parseInt(maxAttendees),
      owner: req.user.id,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      error: 'Failed to create event',
      details: error.message 
    });
  }
});

// Update event
router.put('/events/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updates = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : event.image
    };

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attend event
router.post('/events/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: "Event is full" });
    }

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      event.currentAttendees += 1;
      await event.save();
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this new endpoint to get event attendees
router.get('/:id/attendees', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('attendees', 'name email joinedAt')
      .select('attendees currentAttendees maxAttendees');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const attendees = event.attendees.map(attendee => ({
      id: attendee._id,
      name: attendee.name,
      email: attendee.email,
      joinedAt: attendee.joinedAt || new Date()
    }));

    res.json({
      attendees,
      stats: {
        current: event.currentAttendees,
        maximum: event.maxAttendees,
        available: event.maxAttendees - event.currentAttendees
      }
    });
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

// Get user's events
router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id })
      .populate('owner', 'name')
      .populate('attendees', 'name email')
      .sort('-createdAt');

    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router; 