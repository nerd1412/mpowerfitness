const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { Trainer, User, Booking, NutritionPlan } = require('../models/index');
const { Op, literal } = require('sequelize');

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
    // 1. Clients from confirmed/completed bookings
    const bookings = await Booking.findAll({
      where: { trainerId: req.user.id, status: { [Op.in]: ['confirmed', 'completed'] } },
      attributes: ['userId'],
    });
    const bookingUserIds = bookings.map(b => b.userId);

    // 2. Clients directly assigned by admin (assignedTrainerId)
    const assignedUsers = await User.findAll({
      where: { assignedTrainerId: req.user.id },
      attributes: ['id'],
    });
    const assignedUserIds = assignedUsers.map(u => u.id);

    // Merge both sets, dedup
    const allUserIds = [...new Set([...bookingUserIds, ...assignedUserIds])];

    const clients = allUserIds.length
      ? await User.findAll({
          where: { id: { [Op.in]: allUserIds } },
          attributes: { exclude: ['password', 'refreshToken'] },
        })
      : [];

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

// ── Trainer: list own nutrition plans ─────────────────────────
router.get('/my-nutrition', protect, authorize('trainer'), async (req, res) => {
  try {
    const plans = await NutritionPlan.findAll({
      where: { createdBy: req.user.id, creatorModel: 'Trainer' },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, plans });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Trainer: assign nutrition plan to a client ─────────────────
router.post('/assign-nutrition', protect, authorize('trainer'), async (req, res) => {
  try {
    const { planId, userId } = req.body;
    if (!planId || !userId) return res.status(400).json({ success: false, message: 'planId and userId required' });
    const plan = await NutritionPlan.findByPk(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    // Only allow trainer to assign their own plans
    if (plan.createdBy !== req.user.id) return res.status(403).json({ success: false, message: 'Not your plan' });
    const current = Array.isArray(plan.assignedTo) ? plan.assignedTo : [];
    if (!current.includes(userId)) {
      plan.assignedTo = [...current, userId];
      await plan.save();
    }
    res.json({ success: true, message: 'Plan assigned to client' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
