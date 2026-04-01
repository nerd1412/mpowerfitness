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
  `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chl=${encodeURIComponent(upiLink)}&choe=UTF-8`;

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

    const appLinks = {
      gpay: `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${ref}`,
      phonepe: `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${ref}`,
      paytm: `paytmmp://upi/pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${ref}`,
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

// ── HISTORY ───────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']], limit: 20 });
    res.json({ success: true, payments });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
