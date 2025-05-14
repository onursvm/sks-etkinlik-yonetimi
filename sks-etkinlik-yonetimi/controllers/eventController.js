const { sendEmail } = require('../utils/emailService');

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id,
      status: 'pending'
    });

    // Adminlere bildirim gönder
    const admins = await User.find({ 
      role: 'admin', 
      unit: req.body.unit 
    });

    await Promise.all(admins.map(admin => 
      sendEmail({
        to: admin.email,
        subject: 'Yeni Etkinlik Onay Bekliyor',
        html: `
          <h2>Yeni Etkinlik Onayı</h2>
          <p><strong>Etkinlik:</strong> ${event.title}</p>
          <p><strong>Oluşturan:</strong> ${req.user.name}</p>
          <p>Lütfen yönetim panelinden onaylayınız.</p>
        `
      })
    ));

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};