const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { 
    type: String, 
    required: [true, 'Ad alanı zorunludur'],
    trim: true,
    maxlength: [50, 'Ad en fazla 50 karakter olabilir']
  },
  email: { 
    type: String, 
    required: [true, 'Email alanı zorunludur'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçersiz email adresi']
  },
  password: { 
    type: String, 
    required: [true, 'Şifre alanı zorunludur'], 
    select: false,
    minlength: [8, 'Şifre en az 8 karakter olmalıdır']
  },
  role: { 
    type: String, 
    enum: ['user', 'admin', 'sks', 'management'], 
    default: 'user',
    required: [true, 'Rol alanı zorunludur']
  },
  unit: { 
    type: Schema.Types.ObjectId, 
    ref: 'Unit',
    required: false // Zorunlu olmaktan çıkarıldı
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Email benzersizlik kontrolü
UserSchema.path('email').validate(async function(email) {
  const user = await mongoose.model('User').findOne({ email });
  return !user || this._id.equals(user._id);
}, 'Bu email adresi zaten kullanımda');

module.exports = mongoose.model('User', UserSchema);