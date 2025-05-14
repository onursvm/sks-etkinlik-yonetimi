const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, restrictTo } = require('../auth');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const { generatePDF } = require('../utils/pdfGenerator');

// Tüm etkinlikleri listele (Filtreli)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // Rol bazlı filtreleme
    if (req.user.role === 'user') {
      query.createdBy = req.user.id;
    } else if (req.user.role === 'admin') {
      query.unit = req.user.unit;
    }
    // SKS ve management tüm etkinlikleri görebilir

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .populate('unit', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('[GET /events] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Etkinlikler getirilirken bir hata oluştu',
      error: err.message
    });
  }
});

// Yeni etkinlik oluştur
router.post('/', protect, restrictTo('user', 'admin'), async (req, res) => {
  try {
    const { title, date, description, unit } = req.body;

    // Validasyon
    if (!title || !date || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Başlık, tarih ve birim zorunlu alanlardır'
      });
    }

    // Geçerli bir ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(unit)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz birim ID formatı'
      });
    }

    const event = await Event.create({
      title,
      date,
      description,
      createdBy: req.user.id,
      unit,
      status: 'pending'
    });

    // Adminlere bildirim gönder
    const admins = await User.find({ 
      role: 'admin', 
      unit: unit 
    });

    await Promise.all(admins.map(admin => 
      sendEmail({
        to: admin.email,
        subject: 'Yeni Etkinlik Onay Bekliyor',
        html: `
          <h2>Yeni Etkinlik Onayı</h2>
          <p><strong>Etkinlik:</strong> ${title}</p>
          <p><strong>Oluşturan:</strong> ${req.user.name}</p>
          <p><strong>Tarih:</strong> ${new Date(date).toLocaleString()}</p>
          <p>Lütfen yönetim panelinden onaylayınız.</p>
        `
      })
    ));

    // Populate yapılmış event'i döndür
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('unit', 'name');

    res.status(201).json({
      success: true,
      data: populatedEvent
    });
  } catch (err) {
    console.error('[POST /events] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Etkinlik oluşturulamadı',
      error: err.message
    });
  }
});

// Admin onayı bekleyen etkinlikleri listele
router.get('/admin/pending-events', protect, restrictTo('admin'), async (req, res) => {
  try {
    const events = await Event.find({
      status: 'pending',
      unit: req.user.unit // Sadece adminin birimindekiler
    })
    .populate('createdBy', 'name email')
    .populate('unit', 'name')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('[GET /admin/pending-events] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Bekleyen etkinlikler getirilirken hata oluştu',
      error: err.message
    });
  }
});

// Admin etkinlik onaylama
router.put('/admin/approve-event/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { 
        _id: req.params.id,
        unit: req.user.unit, // Sadece kendi birimindekileri onaylayabilir
        status: 'pending'
      },
      { 
        status: 'approvedByAdmin',
        adminApprovedAt: Date.now() 
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('unit', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı veya onaylama yetkiniz yok'
      });
    }

    // SKS kullanıcılarına bildirim gönder
    const sksUsers = await User.find({ role: 'sks' });
    await Promise.all(sksUsers.map(user => 
      sendEmail({
        to: user.email,
        subject: 'Admin Onaylı Etkinlik Bekliyor',
        html: `
          <h2>Yeni Etkinlik Onayı</h2>
          <p><strong>Etkinlik:</strong> ${event.title}</p>
          <p><strong>Birim:</strong> ${event.unit.name}</p>
          <p>Lütfen SKS panelinden onaylayınız.</p>
        `
      })
    ));

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('[PUT /admin/approve-event] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Etkinlik onaylanırken bir hata oluştu',
      error: err.message
    });
  }
});

// Admin onaylı etkinlikleri listele (SKS için)
router.get('/admin-approved', protect, restrictTo('sks'), async (req, res) => {
  try {
    const events = await Event.find({
      status: 'approvedByAdmin'
    })
    .populate('createdBy', 'name email')
    .populate('unit', 'name')
    .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (err) {
    console.error('[GET /admin-approved] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Admin onaylı etkinlikler getirilirken hata oluştu',
      error: err.message
    });
  }
});

// SKS etkinlik onaylama (Geliştirilmiş versiyon)
router.put('/sks-approve/:id', protect, restrictTo('sks'), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { 
        _id: req.params.id,
        status: 'approvedByAdmin'
      },
      { 
        status: 'approvedBySKS',
        sksApprovedAt: Date.now() 
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate('unit', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı veya onaylama yetkiniz yok'
      });
    }

    // PDF oluştur
    try {
      const pdfPath = await generatePDF(event);
      console.log('PDF oluşturuldu:', pdfPath);
    } catch (pdfError) {
      console.error('PDF oluşturma hatası:', pdfError);
    }

    // Etkinlik sahibine ve adminlere bildirim gönder
    const recipients = [
      event.createdBy.email,
      ...(await User.find({ role: 'admin', unit: event.unit._id }).distinct('email'))
    ];

    await sendEmail({
      to: recipients.join(','),
      subject: 'Etkinlik SKS Tarafından Onaylandı',
      html: `
        <h2>Etkinlik Onayı</h2>
        <p><strong>Etkinlik:</strong> ${event.title}</p>
        <p><strong>Birim:</strong> ${event.unit.name}</p>
        <p><strong>Durum:</strong> SKS tarafından onaylandı</p>
        <p><strong>Onay Tarihi:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('[PUT /sks-approve] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Etkinlik onaylanırken bir hata oluştu',
      error: err.message
    });
  }
});

// Tekil etkinlik detayı
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('unit', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı'
      });
    }

    // Yetki kontrolü
    if (req.user.role === 'user' && event.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği görüntüleme yetkiniz yok'
      });
    }

    if (req.user.role === 'admin' && event.unit._id.toString() !== req.user.unit.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bu etkinliği görüntüleme yetkiniz yok'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (err) {
    console.error('[GET /events/:id] Error:', err);
    res.status(500).json({
      success: false,
      message: 'Etkinlik detayları getirilirken bir hata oluştu',
      error: err.message
    });
  }
});

module.exports = router;