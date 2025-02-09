const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, search, sort = '-createdAt' } = req.query;
    let query = {};

    if (category && category !== 'all') query.category = category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOption = sort === 'date' ? { eventDate: 1 } :
                       sort === '-date' ? { eventDate: -1 } :
                       { [sort]: -1 };

    const events = await Event.find(query).populate('owner', 'name').sort(sortOption);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('owner', 'name').populate('attendees', 'name email');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});


// Upload image to Cloudinary
const uploadImageToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'image_uploads' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
router.post('/events', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, eventDate, eventTime, location, maxAttendees } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = await uploadImageToCloudinary(req.file.buffer);
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
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// Update event
router.put('/events/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = await uploadImageToCloudinary(req.file.buffer);
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.owner.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Attend event
router.post('/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.currentAttendees >= event.maxAttendees) return res.status(400).json({ message: 'Event is full' });
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

// Get event attendees
router.get('/:id/attendees', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees', 'name email');
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ attendees: event.attendees, availableSeats: event.maxAttendees - event.currentAttendees });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
});

// Get user's events
router.get('/my-events', auth, async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id }).populate('attendees', 'name email').sort('-createdAt');
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
