const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  title: { 
    type: String, 
    required: [true, 'Etkinlik başlığı gereklidir'],
    trim: true
  },
  date: { 
    type: Date, 
    required: [true, 'Etkinlik tarihi gereklidir'] 
  },
  description: { 
    type: String, 
    trim: true 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit',
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'approvedByAdmin', 'approvedBySKS', 'rejected'],
    default: 'pending'
  },
  adminApprovedAt: Date,
  sksApprovedAt: Date,
  rejectedAt: Date,
  rejectedReason: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Otomatik populate işlemi
EventSchema.pre(/^find/, function(next) {
  this.populate('createdBy', 'name email').populate('unit', 'name');
  next();
});

module.exports = mongoose.model('Event', EventSchema);