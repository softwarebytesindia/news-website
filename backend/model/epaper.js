const mongoose = require('mongoose');

const epaperSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    unique: true // Usually one epaper per day
  },
  pdfUrl: {
    type: String,
    required: [true, 'PDF URL is required']
  },
  coverImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Sort by date descending by default
epaperSchema.index({ date: -1 });

module.exports = mongoose.model('Epaper', epaperSchema);
