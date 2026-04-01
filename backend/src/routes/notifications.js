const express = require('express');
const { protect } = require('../middleware/auth');
const { Notification } = require('../models/index');
const { Op } = require('sequelize');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { unread, limit = 30 } = req.query;
    const where = { recipientId: req.user.id };
    if (unread === 'true') where.isRead = false;
    const notifications = await Notification.findAll({
      where, order: [['createdAt', 'DESC']], limit: parseInt(limit),
    });
    const unreadCount = await Notification.count({ where: { recipientId: req.user.id, isRead: false } });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/mark-all-read', async (req, res) => {
  try {
    await Notification.update({ isRead: true, readAt: new Date() }, { where: { recipientId: req.user.id, isRead: false } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/read', async (req, res) => {
  try {
    await Notification.update({ isRead: true, readAt: new Date() }, { where: { id: req.params.id, recipientId: req.user.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, recipientId: req.user.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
