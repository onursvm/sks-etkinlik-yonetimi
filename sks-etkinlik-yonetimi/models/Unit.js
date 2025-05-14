const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UnitSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Birim adı zorunludur'],
    unique: true,
    trim: true,
    maxlength: [50, 'Birim adı en fazla 50 karakter olabilir']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Unit', UnitSchema);
