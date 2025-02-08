const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  category: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  maxAttendees: {
    type: Number,
    default: 100
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketPrice: { type: Number, default: 0 },
  isPrivate: { type: Boolean, default: false },
  requiresApproval: { type: Boolean, default: false },
  allowsCancellation: { type: Boolean, default: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  likes: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true
});

// Add index for better search performance
eventSchema.index({ title: 'text', description: 'text' });

// Add method to check if event is full
eventSchema.methods.isFull = function() {
  return this.currentAttendees >= this.maxAttendees;
};

// Add method to check if user is attending
eventSchema.methods.isUserAttending = function(userId) {
  return this.attendees.includes(userId);
};

const EventModel = mongoose.model('Event', eventSchema);
module.exports = EventModel; 