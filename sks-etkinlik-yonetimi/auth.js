const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { sendEmail } = require('./utils/emailService');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET ortam değişkeni tanımlı değil!');
const JWT_EXPIRES_IN = '1d';

// Kullanıcı kaydı
exports.register = async (name, email, password, role, unit) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Bu email adresiyle kayıtlı bir kullanıcı zaten var');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    unit,
    isVerified: req.user?.role === 'management'
  });

  await user.save();
  
  if (process.env.NODE_ENV === 'production') {
    try {
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
      const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
      
      await sendEmail({
        to: email,
        subject: 'Email Doğrulama',
        html: `Merhaba ${name},<br><br>Hesabınızı doğrulamak için lütfen <a href="${verificationLink}">bu linke</a> tıklayın.`
      });
    } catch (error) {
      console.error('Email gönderilemedi:', error);
    }
  }

  return user;
};

// Kullanıcı girişi
exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Geçersiz email veya şifre');
  }

  if (process.env.NODE_ENV === 'production' && !user.isVerified) {
    throw new Error('Email adresinizi doğrulayın');
  }

  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      unit: user.unit
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { 
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      unit: user.unit
    }, 
    token 
  };
};

// Token doğrulama
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Yetkiniz yok, lütfen giriş yapın' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Bu token ile ilişkili kullanıcı bulunamadı' 
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      message: 'Geçersiz token' 
    });
  }
};

// Rol bazlı yetkilendirme (GÜNCELLENDİ - management rolü eklendi)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Bu işlem için yetkiniz yok' 
      });
    }
    next();
  };
};

// YÖNETİM ROLÜNE ÖZEL MIDDLEWARE (Opsiyonel)
exports.isManagement = (req, res, next) => {
  if (req.user?.role !== 'management') {
    return res.status(403).json({ 
      success: false,
      message: 'Sadece yönetim rolü erişebilir' 
    });
  }
  next();
};

// Email doğrulama
exports.verifyEmail = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true },
      { new: true }
    );
    
    if (!user) {
      throw new Error('Geçersiz token');
    }
    
    return user;
  } catch (error) {
    console.error('Doğrulama hatası:', error);
    throw new Error('Email doğrulama başarısız');
  }
};
