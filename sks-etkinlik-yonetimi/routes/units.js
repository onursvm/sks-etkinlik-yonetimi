const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const User = require('../models/User');
const { protect, restrictTo } = require('../auth');
const mongoose = require('mongoose');

// Tüm birimleri listele (Yetki gerektirmez)
router.get('/', async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: units.length,
      data: units
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// Yeni birim oluştur (Sadece yönetici)
router.post('/', 
  protect,
  restrictTo('management'),
  async (req, res) => {
    try {
      const { name } = req.body;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Birim adı en az 2 karakter olmalıdır'
        });
      }

      const unit = await Unit.create({ name });
      
      res.status(201).json({
        success: true,
        data: unit
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Bu birim zaten kayıtlı'
        });
      }
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// Birim sil (Sadece yönetici)
router.delete('/:id',
  protect,
  restrictTo('management'),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Geçersiz birim ID'
        });
      }

      // Birime bağlı kullanıcı kontrolü
      const usersCount = await User.countDocuments({ unit: req.params.id });
      if (usersCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Bu birime kayıtlı kullanıcılar var'
        });
      }

      const unit = await Unit.findByIdAndDelete(req.params.id);
      
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Birim bulunamadı'
        });
      }

      res.json({
        success: true,
        data: {}
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

module.exports = router;
