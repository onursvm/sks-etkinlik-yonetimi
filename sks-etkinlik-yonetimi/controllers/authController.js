const User = require('../../models/User');
const { sendEmail } = require('../../utils/emailService');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail({
      to: email,
      subject: 'Email Doğrulama',
      html: `Doğrulama linki: <a href="${verificationLink}">Tıklayın</a>`
    });

    res.status(201).json({ 
      success: true,
      message: 'Doğrulama maili gönderildi',
      userId: user._id
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message
    });
  }
};
