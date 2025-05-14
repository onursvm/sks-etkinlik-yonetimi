const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Unit = require('../models/Unit');
const { protect, restrictTo } = require('../auth');
const bcrypt = require('bcryptjs');

// TÜM KULLANICILARI LİSTELE (Yönetici için)
router.get('/',
  protect,
  restrictTo('management'),
  async (req, res) => {
    try {
      const users = await User.find()
        .select('-password')
        .populate('unit', 'name')
        .lean();

      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
      });
    }
  }
);

// KULLANICI SİL (Yönetici için)
router.delete('/:id',
  protect,
  restrictTo('management'),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Kullanıcı bulunamadı'
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

// KULLANICI GÜNCELLE (Yönetici için)
router.put('/:id',
  protect,
  restrictTo('management'),
  async (req, res) => {
    try {
      const { name, email, role, unit } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { name, email, role, unit },
        { new: true }
      ).select('-password').populate('unit', 'name');

      res.json({
        success: true,
        data: user
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  }
);

module.exports = router;
