const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { User, Trainer, Admin, Notification } = require('../models/index');
const { generateTokens, hashPassword, comparePassword, protect, refreshTokenMiddleware } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
  next();
};

const buildUserResponse = (user, role) => {
  const base = { id: user.id, name: user.name, email: user.email, role, avatar: user.avatar, phone: user.phone };
  if (role === 'user') return {
    ...base,
    onboardingCompleted: user.onboardingCompleted,
    fitnessGoal: user.fitnessGoal, fitnessLevel: user.fitnessLevel,
    lifestyle: user.lifestyle, age: user.age, gender: user.gender,
    height: user.height, weight: user.weight, targetWeight: user.targetWeight,
    streak: user.streak, longestStreak: user.longestStreak,
    totalWorkouts: user.totalWorkouts, totalCaloriesBurned: user.totalCaloriesBurned,
    points: user.points, badges: user.badges,
    assignedTrainerId: user.assignedTrainerId,
    subscription: {
      plan: user.subscriptionPlan,
      isActive: user.subscriptionActive,
      startDate: user.subscriptionStartDate,
      endDate: user.subscriptionEndDate,
    },
  };
  if (role === 'trainer') return {
    ...base,
    specializations: user.specializations, certifications: user.certifications,
    experience: user.experience, bio: user.bio,
    sessionRate: user.sessionRate, monthlyRate: user.monthlyRate,
    isApproved: user.isApproved, rating: user.rating, totalRatings: user.totalRatings,
    totalSessions: user.totalSessions, totalEarnings: user.totalEarnings,
    availability: user.availability, upiId: user.upiId,
  };
  return { ...base, role: user.role, permissions: user.permissions };
};

// ── USER AUTH ──────────────────────────────────────────────────
router.post('/user/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashedPw = await hashPassword(password);
    const user = await User.create({ name, email, password: hashedPw, phone });
    const tokens = generateTokens(user.id, 'user');
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();
    res.status(201).json({ success: true, message: 'Registered successfully', user: buildUserResponse(user, 'user'), ...tokens });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/user/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    const tokens = generateTokens(user.id, 'user');
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();
    res.json({ success: true, message: 'Login successful', user: buildUserResponse(user, 'user'), ...tokens });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── TRAINER AUTH ───────────────────────────────────────────────
router.post('/trainer/register', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('specializations').isArray({ min: 1 }).withMessage('At least one specialization required'),
  body('experience').isNumeric(),
], validate, async (req, res) => {
  try {
    const { name, email, password, phone, specializations, certifications, experience, bio, sessionRate, monthlyRate } = req.body;
    const existing = await Trainer.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashedPw = await hashPassword(password);
    const trainer = await Trainer.create({
      name, email, password: hashedPw, phone,
      specializations: specializations || [],
      certifications: certifications || [],
      experience: parseInt(experience) || 0,
      bio, sessionRate, monthlyRate,
      isApproved: false,
    });

    // Notify all active admins about the new trainer application
    try {
      const { emitNotification } = require('../utils/socketHandler');
      const admins = await Admin.findAll({ where: { isActive: true } });
      await Promise.all(admins.map(async admin => {
        const notif = await Notification.create({
          recipientId: admin.id,
          recipientModel: 'Admin',
          title: 'New Trainer Application',
          message: `${name} (${email}) has applied to become a trainer. Review and approve or reject their application.`,
          type: 'system',
          actionUrl: '/admin/trainers',
          data: JSON.stringify({ trainerId: trainer.id, trainerName: name, trainerEmail: email }),
        });
        emitNotification(req.app.get('io'), 'Admin', admin.id, notif.toJSON());
      }));
    } catch (_) { /* non-fatal */ }

    res.status(201).json({ success: true, message: 'Registration submitted. Awaiting admin approval.', trainer: { id: trainer.id, name: trainer.name, email: trainer.email, isApproved: false } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/trainer/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const trainer = await Trainer.findOne({ where: { email } });
    if (!trainer || !(await comparePassword(password, trainer.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!trainer.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    if (!trainer.isApproved) return res.status(403).json({ success: false, message: 'Account pending admin approval', code: 'PENDING_APPROVAL' });
    const tokens = generateTokens(trainer.id, 'trainer');
    trainer.refreshToken = tokens.refreshToken;
    trainer.lastLogin = new Date();
    await trainer.save();
    res.json({ success: true, message: 'Login successful', user: buildUserResponse(trainer, 'trainer'), ...tokens });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ADMIN AUTH ─────────────────────────────────────────────────
router.post('/admin/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin || !(await comparePassword(password, admin.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!admin.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    const tokens = generateTokens(admin.id, admin.role);
    admin.refreshToken = tokens.refreshToken;
    admin.lastLogin = new Date();
    await admin.save();
    res.json({ success: true, message: 'Login successful', user: buildUserResponse(admin, admin.role), ...tokens });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ONBOARDING ─────────────────────────────────────────────────
router.post('/user/onboarding', protect, async (req, res) => {
  try {
    const allowed = ['fitnessGoal','fitnessLevel','lifestyle','preferredWorkoutTime','workoutDaysPerWeek','age','gender','height','weight','targetWeight'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.onboardingCompleted = true;
    await User.update(updates, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id);
    res.json({ success: true, user: buildUserResponse(user, 'user') });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── REFRESH ────────────────────────────────────────────────────
router.post('/refresh', refreshTokenMiddleware);

router.post('/logout', protect, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ success: true, message: 'Logged out' });
  } catch { res.json({ success: true }); }
});

router.get('/me', protect, async (req, res) => {
  const role = req.userRole;
  res.json({ success: true, user: buildUserResponse(req.user, role) });
});

module.exports = router;
