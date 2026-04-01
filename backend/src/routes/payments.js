const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { protect, authorize } = require('../middleware/auth');
const { Payment, Booking, User, Admin } = require('../models/index');

const generateRef = () => 'MPF' + Date.now() + crypto.randomBytes(3).toString('hex').toUpperCase();

const getUpiSettings = async () => {
  const admin = await Admin.findOne({ where: { isActive: true } });
  return {
    upiId: (admin && admin.upiId) || process.env.UPI_ID || 'payments@mpowerfitness',
    upiName: (admin && admin.upiName) || process.env.UPI_NAME || 'Mpower Fitness',
  };
};

const buildUpiLink = (upiId, upiName, amount, ref, note) => {
  const p = new URLSearchParams({ pa: upiId, pn: upiName, am: amount.toFixed(2), cu: 'INR', tn: note, tr: ref });
  return `upi://pay?${p.toString()}`;
};

const buildQrUrl = (upiLink) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=280x280&format=png&ecc=M&data=${encodeURIComponent(upiLink)}`;

// ── INITIATE ──────────────────────────────────
router.post('/upi/initiate', protect, authorize('user'), async (req, res) => {
  try {
    const { amount, type, subscriptionPlan, bookingId, programId, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const { upiId, upiName } = await getUpiSettings();
    const ref = generateRef();
    const note = description || (type === 'subscription' ? `${subscriptionPlan} plan` : type === 'session_booking' ? 'Trainer session' : 'Mpower Fitness');
    const upiLink = buildUpiLink(upiId, upiName, amount, ref, note);

    const payment = await Payment.create({
      userId: req.user.id, amount, type, status: 'pending',
      transactionRef: ref, description: note,
      subscriptionPlan: subscriptionPlan || null,
      bookingId: bookingId || null,
      programId: programId || null,
    });

    const enc = encodeURIComponent;
    const base = `pa=${upiId}&pn=${enc(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${enc(note)}&tr=${ref}`;
    const appLinks = {
      gpay:    `tez://upi/pay?${base}`,
      phonepe: `phonepe://pay?${base}`,
      paytm:   `paytmmp://upi/pay?${base}`,
      bhim:    `upi://pay?${base}`,
      cred:    `credpay://pay?${base}`,
      jio:     `jiomoney://upi/pay?${base}`,
    };

    res.json({
      success: true,
      payment: { id: payment.id, ref, amount, upiId, merchantName: upiName, note },
      upiLink, qrUrl: buildQrUrl(upiLink), appLinks, expiresIn: 600
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── STATUS ────────────────────────────────────
router.get('/upi/status/:ref', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ where: { transactionRef: req.params.ref, userId: req.user.id } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, status: payment.status, payment: { id: payment.id, ref: payment.transactionRef, amount: payment.amount, status: payment.status, utr: payment.utrNumber } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── VERIFY (UTR submission) ───────────────────
router.post('/upi/verify', protect, authorize('user'), async (req, res) => {
  try {
    const { paymentId, utr, senderUpiId } = req.body;
    if (!paymentId || !utr) return res.status(400).json({ success: false, message: 'Payment ID and UTR required' });
    if (!/^\d{12}$/.test(utr.trim())) return res.status(400).json({ success: false, message: 'Invalid UTR. Must be 12 digits.' });

    const payment = await Payment.findOne({ where: { id: paymentId, userId: req.user.id } });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'success') return res.json({ success: true, message: 'Already verified', payment });

    payment.status = 'success';
    payment.utrNumber = utr.trim();
    if (senderUpiId) payment.senderUpiId = senderUpiId;
    await payment.save();

    // Activate subscription
    if (payment.type === 'subscription' && payment.subscriptionPlan) {
      const months = { monthly: 1, quarterly: 3, premium: 12 }[payment.subscriptionPlan] || 1;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      await User.update({
        subscriptionPlan: payment.subscriptionPlan,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: endDate,
        subscriptionActive: true,
      }, { where: { id: req.user.id } });
    }

    // Mark booking paid
    if (payment.type === 'session_booking' && payment.bookingId) {
      await Booking.update({ paymentStatus: 'paid' }, { where: { id: payment.bookingId } });
    }

    const io = req.app.get('io');
    if (io) io.to(`user_${req.user.id}`).emit('payment_success', { paymentId: payment.id, amount: payment.amount });

    res.json({ success: true, message: 'Payment verified! Your plan is now active.', payment: { id: payment.id, amount: payment.amount, utr: utr.trim(), status: 'success' } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ADMIN: list all payments ───────────────────
router.get('/admin/all', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = status ? { status } : {};
    const payments = await Payment.findAll({
      where, order: [['createdAt', 'DESC']],
      limit: +limit, offset: (+page - 1) * +limit,
    });
    const total = await Payment.count({ where });
    res.json({ success: true, payments, total });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ADMIN: manually verify payment ────────────
router.patch('/admin/:paymentId/verify', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { utr, notes } = req.body;
    const payment = await Payment.findByPk(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.status === 'success') return res.json({ success: true, message: 'Already verified', payment });

    payment.status = 'success';
    if (utr) payment.utrNumber = utr.trim();
    if (notes) payment.description = (payment.description || '') + ` [Admin: ${notes}]`;
    await payment.save();

    if (payment.type === 'subscription' && payment.subscriptionPlan) {
      const months = { monthly: 1, quarterly: 3, premium: 12 }[payment.subscriptionPlan] || 1;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + months);
      await User.update({
        subscriptionPlan: payment.subscriptionPlan,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: endDate,
        subscriptionActive: true,
      }, { where: { id: payment.userId } });
    }
    if (payment.type === 'session_booking' && payment.bookingId) {
      await Booking.update({ paymentStatus: 'paid' }, { where: { id: payment.bookingId } });
    }
    const io = req.app.get('io');
    if (io) io.to(`user_${payment.userId}`).emit('payment_success', { paymentId: payment.id, amount: payment.amount });
    res.json({ success: true, message: 'Payment verified by admin', payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ADMIN: reject payment ──────────────────────
router.patch('/admin/:paymentId/reject', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.status = 'failed';
    await payment.save();
    res.json({ success: true, message: 'Payment rejected', payment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── HISTORY ───────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']], limit: 20 });
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
