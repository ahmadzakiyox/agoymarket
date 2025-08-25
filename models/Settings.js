// models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    whatsappNumber: { type: String, default: '' },
    telegramUsername: { type: String, default: '' }
});

// Kita hanya akan punya satu dokumen di collection ini
module.exports = mongoose.model('Setting', settingSchema);