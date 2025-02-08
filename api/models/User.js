const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'guest'], default: 'user' },
  eventsAttending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  eventsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  profilePicture: String,
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;