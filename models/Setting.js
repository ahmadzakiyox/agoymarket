const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    whatsappNumber: { 
        type: String, 
        default: '' 
    },
    telegramUsername: { 
        type: String, 
        default: '' 
    }
});

// Hanya akan ada satu dokumen di dalam collection ini
module.exports = mongoose.model('Setting', settingSchema);