const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const { ConsultationRequest, Admin, Notification, User } = require('../models/index');
const { emitNotification } = require('../utils/socketHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'mpower_jwt_secret_dev_key_min_64_chars_long_enough';

// Optional auth — attaches req.user if valid token present, but never rejects
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      if (decoded.role === 'user') {
        const user = await User.findByPk(decoded.id);
        if (user && user.isActive) req.user = user;
      }
    }
  } catch (_) { /* token invalid/expired — just proceed unauthenticated */ }
  next();
};

// ── Submit free consultation (public or authenticated) ──
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, age, gender, healthConditions, primaryGoal,
      currentChallenges, fitnessLevel, budgetSegment, deliveryPreference } = req.body;
    if (!name || !email || !primaryGoal) {
      return res.status(400).json({ success: false, message: 'Name, email and goal are required' });
    }
    const cr = await ConsultationRequest.create({
      userId: req.user?.id || null,
      name, email, phone, age, gender,
      healthConditions: healthConditions || [],
      primaryGoal, currentChallenges, fitnessLevel,
      budgetSegment: budgetSegment || 'mid',
      deliveryPreference: deliveryPreference || 'online',
    });

    // Notify all active admins
    const io = req.app.get('io');
    const admins = await Admin.findAll({ where: { isActive: true } });
    await Promise.all(admins.map(async admin => {
      const notif = await Notification.create({
        recipientId: admin.id, recipientModel: 'Admin',
        title: 'New Consultation Request',
        message: `${name} (${email}) has requested a free health consultation. Goal: ${primaryGoal}.`,
        type: 'system',
        actionUrl: '/admin/consultations',
      });
      emitNotification(io, 'Admin', admin.id, notif.toJSON());
    }));

    // Mark user as having submitted consultation (hides CTA on dashboard)
    if (req.user?.id) {
      await User.update({ consultationDone: true }, { where: { id: req.user.id } });
    }
    res.status(201).json({ success: true, message: 'Request submitted! We will contact you within 24 hours.', id: cr.id });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Admin: list all requests ─────────────────────────
router.get('/admin/all', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 30 } = req.query;
    const where = status ? { status } : {};
    const requests = await ConsultationRequest.findAll({
      where, order: [['createdAt', 'DESC']],
      limit: +limit, offset: (+page - 1) * +limit,
    });
    const total = await ConsultationRequest.count({ where });
    res.json({ success: true, requests, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── Admin: update status / assign trainer ────────────
router.patch('/admin/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const cr = await ConsultationRequest.findByPk(req.params.id);
    if (!cr) return res.status(404).json({ success: false, message: 'Request not found' });
    const { status, adminNotes, assignedTrainerId } = req.body;
    if (status) cr.status = status;
    if (adminNotes) cr.adminNotes = adminNotes;
    if (assignedTrainerId) cr.assignedTrainerId = assignedTrainerId;
    await cr.save();
    res.json({ success: true, request: cr });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
