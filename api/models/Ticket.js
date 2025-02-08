const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate ticket number before saving
TicketSchema.pre('save', function(next) {
  if (!this.ticketNumber) {
    // Generate a random ticket number
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.ticketNumber = `TKT-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
