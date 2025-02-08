const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');
const WebSocket = require('ws');

// Book a ticket
router.post('/tickets', auth, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is fully booked' });
    }

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({ 
      event: eventId, 
      user: userId,
      status: 'active'
    });
    
    if (existingTicket) {
      return res.status(400).json({ error: 'You already have a ticket for this event' });
    }

    // Create new ticket
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      status: 'active',
      ticketNumber: Math.random().toString(36).substr(2, 9).toUpperCase()
    });

    // Save ticket first
    await ticket.save();

    // Then update event attendees
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      event.currentAttendees = event.attendees.length;
      await event.save();
    }

    // Populate event details before sending response
    await ticket.populate([
      {
        path: 'event',
        select: 'title eventDate eventTime location image'
      },
      {
        path: 'user',
        select: 'name email'
      }
    ]);

    // After successful booking, broadcast the update
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'ATTENDEE_UPDATE',
          eventId: event._id,
          currentAttendees: event.currentAttendees,
          attendees: event.attendees
        }));
      }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Ticket booking error:', error);
    res.status(500).json({ 
      error: 'Failed to book ticket',
      details: error.message 
    });
  }
});

// Get user's tickets
router.get('/tickets', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ 
      user: req.user._id 
    }).populate({
      path: 'event',
      select: 'title eventDate eventTime location image'
    }).sort('-bookedAt');

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Cancel ticket
router.post('/tickets/:id/cancel', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      status: 'active'
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Active ticket not found' });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    await ticket.save();

    // Update event attendees
    const event = await Event.findById(ticket.event);
    if (event) {
      event.attendees = event.attendees.filter(id => !id.equals(req.user._id));
      event.currentAttendees = Math.max(0, event.currentAttendees - 1);
      await event.save();
    }

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
});

module.exports = router;