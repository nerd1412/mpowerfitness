const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { Trainer, User, Booking } = require('../models/index');
const { Op } = require('sequelize');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, city, specialization } = req.query;
    const where = { isApproved: true, isActive: true };
    if (city) where.city = { [Op.like]: `%${city}%` };

    const trainers = await Trainer.findAll({
      where, attributes: { exclude: ['password', 'refreshToken'] },
      order: [['rating', 'DESC']],
    });

    const filtered = trainers.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || (t.bio || '').toLowerCase().includes(q) || (t.specializations || []).some(s => s.toLowerCase().includes(q));
      }
      if (specialization) return (t.specializations || []).includes(specialization);
      return true;
    });

    res.json({ success: true, trainers: filtered });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/my-clients', protect, authorize('trainer'), async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { trainerId: req.user.id, status: { [Op.in]: ['confirmed', 'completed'] } },
      attributes: ['userId'],
    });
    const userIds = [...new Set(bookings.map(b => b.userId))];
    const clients = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: { exclude: ['password', 'refreshToken'] },
    });
    res.json({ success: true, clients });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/availability', protect, authorize('trainer'), async (req, res) => {
  try {
    await Trainer.update({ availability: req.body.availability }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Availability updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/profile', protect, authorize('trainer'), async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.user.id, { attributes: { exclude: ['password', 'refreshToken'] } });
    res.json({ success: true, trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/profile', protect, authorize('trainer'), async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'bio', 'specializations', 'certifications', 'experience', 'sessionRate', 'monthlyRate', 'city', 'state', 'upiId', 'isOnline'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await Trainer.update(updates, { where: { id: req.user.id } });
    const trainer = await Trainer.findByPk(req.user.id, { attributes: { exclude: ['password', 'refreshToken'] } });
    res.json({ success: true, trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
