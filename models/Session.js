// models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    sessionID: { type: String, required: true, unique: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);