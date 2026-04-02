const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { protect, authorize, hashPassword } = require('../middleware/auth');
const { User, Trainer, Admin, Booking, Payment, Program, NutritionPlan, Workout, Notification, WorkoutSession, Blog } = require('../models/index');


const { emitNotification } = require('../utils/socketHandler');

const adminAuth = [protect, authorize('admin', 'superadmin')];

// ── ADMIN DIRECT-ADD TRAINER ───────────────────────────────────
router.post('/trainers/add', ...adminAuth, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { name, email, password, phone, specializations, experience, bio, sessionRate, monthlyRate, city, state, isApproved } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const existing = await Trainer.findOne({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const hashedPw = await bcrypt.hash(password, 10);
    const trainer = await Trainer.create({
      name, email, password: hashedPw, phone,
      specializations: specializations || [],
      experience: parseInt(experience) || 0,
      bio, sessionRate: parseFloat(sessionRate) || 500,
      monthlyRate: parseFloat(monthlyRate) || 3000,
      city: city || '', state: state || '',
      isApproved: isApproved !== false,
      isActive: true,
    });
    res.status(201).json({ success: true, trainer: { id: trainer.id, name: trainer.name, email: trainer.email, isApproved: trainer.isApproved }, message: `Trainer ${name} added successfully` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── DASHBOARD ──────────────────────────────────────────────────
router.get('/dashboard', ...adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalTrainers, approvedTrainers, pendingApprovals,
           totalBookings, completedBookings, activeSubscriptions] = await Promise.all([
      User.count(),
      Trainer.count(),
      Trainer.count({ where: { isApproved: true } }),
      Trainer.count({ where: { isApproved: false } }),
      Booking.count(),
      Booking.count({ where: { status: 'completed' } }),
      User.count({ where: { subscriptionActive: true } }),
    ]);

    const newUsersThisMonth = await User.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });
    const bookingsThisMonth = await Booking.count({ where: { createdAt: { [Op.gte]: startOfMonth } } });

    // Revenue
    const revenueAll = await Payment.sum('amount', { where: { status: 'success' } }) || 0;
    const revenueMonth = await Payment.sum('amount', { where: { status: 'success', createdAt: { [Op.gte]: startOfMonth } } }) || 0;

    const topTrainers = await Trainer.findAll({
      where: { isApproved: true },
      attributes: ['id','name','avatar','totalEarnings','rating','totalSessions'],
      order: [['totalEarnings', 'DESC']],
      limit: 5
    });

    // 6-month charts
    const revenueChart = [];
    const userChart = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const rev = await Payment.sum('amount', { where: { status: 'success', createdAt: { [Op.between]: [d, end] } } }) || 0;
      const users = await User.count({ where: { createdAt: { [Op.lte]: end } } });
      const mon = d.toLocaleString('en', { month: 'short' });
      revenueChart.push({ month: mon, revenue: rev });
      userChart.push({ month: mon, users });
    }
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const revenuePrevMonth = await Payment.sum('amount', { where: { status: 'success', createdAt: { [Op.between]: [prevMonthStart, prevMonthEnd] } } }) || 0;
    const revenueGrowth = revenuePrevMonth > 0 ? Math.round(((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100) : 0;
    const pendingTrainers = await Trainer.findAll({
      where: { isApproved: false, isActive: true },
      attributes: ['id', 'name', 'email', 'experience', 'specializations', 'createdAt'],
      order: [['createdAt', 'ASC']], limit: 10,
    });
    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, newUsersThisMonth, totalTrainers, approvedTrainers,
          pendingApprovals, totalBookings, bookingsThisMonth, completedBookings,
          totalRevenue: revenueAll, revenueThisMonth: revenueMonth,
          revenueGrowth, activeSubscriptions
        },
        topTrainers, pendingTrainers, revenueChart, userChart,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── TRAINER MANAGEMENT ─────────────────────────────────────────
router.get('/trainers', ...adminAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};
    if (status === 'approved') where.isApproved = true;
    else if (status === 'pending') where.isApproved = false;
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
    const trainers = await Trainer.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, trainers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/trainers/:id', ...adminAuth, async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    res.json({ success: true, trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/trainers/:id/approve', ...adminAuth, async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    trainer.isApproved = true;
    await trainer.save();
    const approvalNotif = await Notification.create({
      recipientId: trainer.id, recipientModel: 'Trainer',
      title: 'Account Approved!',
      message: 'Your trainer account has been approved. You can now log in and start accepting clients.',
      type: 'system'
    });
    emitNotification(req.app.get('io'), 'Trainer', trainer.id, approvalNotif.toJSON());
    res.json({ success: true, message: 'Trainer approved', trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/trainers/:id/reject', ...adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
    trainer.isApproved = false;
    trainer.isActive = false;
    await trainer.save();
    const rejectNotif = await Notification.create({
      recipientId: trainer.id, recipientModel: 'Trainer',
      title: 'Application Update',
      message: reason
        ? `Your trainer application was not approved. Reason: ${reason}`
        : 'Your trainer application was not approved at this time. You may reapply after addressing any concerns.',
      type: 'system',
    });
    emitNotification(req.app.get('io'), 'Trainer', trainer.id, rejectNotif.toJSON());
    res.json({ success: true, message: 'Trainer rejected' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/trainers/:id/toggle-active', ...adminAuth, async (req, res) => {
  try {
    const trainer = await Trainer.findByPk(req.params.id);
    if (!trainer) return res.status(404).json({ success: false, message: 'Not found' });
    trainer.isActive = !trainer.isActive;
    await trainer.save();
    res.json({ success: true, trainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USER MANAGEMENT ────────────────────────────────────────────
router.get('/users', ...adminAuth, async (req, res) => {
  try {
    const { search, subscription } = req.query;
    const where = {};
    if (search) where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
    if (subscription && subscription !== 'all') where.subscriptionPlan = subscription;
    const users = await User.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/users/:id', ...adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    let assignedTrainer = null;
    if (user.assignedTrainerId) {
      assignedTrainer = await Trainer.findByPk(user.assignedTrainerId, { attributes: ['id','name','email','avatar','specializations','rating'] });
    }
    res.json({ success: true, user, assignedTrainer });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/users/:id/assign-trainer', ...adminAuth, async (req, res) => {
  try {
    const { trainerId } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (trainerId) {
      const trainer = await Trainer.findByPk(trainerId);
      if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });
      // Add user to trainer's clients
      const clients = trainer.clients || [];
      if (!clients.includes(req.params.id)) {
        trainer.clients = [...clients, req.params.id];
        await trainer.save();
      }
    }
    const previousTrainerId = user.assignedTrainerId;
    user.assignedTrainerId = trainerId || null;
    await user.save();

    // Remove user from previous trainer's clients list if trainer changed
    if (previousTrainerId && previousTrainerId !== trainerId) {
      const prevTrainer = await Trainer.findByPk(previousTrainerId);
      if (prevTrainer) {
        prevTrainer.clients = (prevTrainer.clients || []).filter(id => id !== req.params.id);
        await prevTrainer.save();
      }
    }

    // Notify user
    const userNotif = await Notification.create({
      recipientId: user.id, recipientModel: 'User',
      title: trainerId ? 'Trainer Assigned to You' : 'Trainer Assignment Removed',
      message: trainerId
        ? `A certified trainer has been assigned to your account and is ready to support your fitness journey.`
        : 'Your trainer assignment has been removed.',
      type: 'system',
    });
    emitNotification(req.app.get('io'), 'User', user.id, userNotif.toJSON());

    // Notify assigned trainer
    if (trainerId) {
      const trainer = await Trainer.findByPk(trainerId);
      if (trainer) {
        await Notification.create({
          recipientId: trainer.id, recipientModel: 'Trainer',
          title: 'New Client Assigned',
          message: `${user.name} has been assigned to you as a client by the admin. Check your clients list.`,
          type: 'new_client',
          actionUrl: '/trainer/clients',
          data: JSON.stringify({ userId: user.id, userName: user.name }),
        });
        const io = req.app.get('io');
        if (io) io.to(`trainer_${trainerId}`).emit('new_client', { userId: user.id, userName: user.name });
      }
    }

    res.json({ success: true, message: 'Trainer assigned', user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/users/:id/toggle-active', ...adminAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── WORKOUT MANAGEMENT ─────────────────────────────────────────
router.get('/workouts', ...adminAuth, async (req, res) => {
  try {
    const workouts = await Workout.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, workouts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/workouts', ...adminAuth, async (req, res) => {
  try {
    const workout = await Workout.create({ ...req.body, createdBy: req.user.id, creatorModel: 'Admin' });
    res.status(201).json({ success: true, workout });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/workouts/:id', ...adminAuth, async (req, res) => {
  try {
    const [count] = await Workout.update(req.body, { where: { id: req.params.id } });
    if (!count) return res.status(404).json({ success: false, message: 'Not found' });
    const workout = await Workout.findByPk(req.params.id);
    res.json({ success: true, workout });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/workouts/:id', ...adminAuth, async (req, res) => {
  try {
    await Workout.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/workouts/:id/assign', ...adminAuth, async (req, res) => {
  try {
    const { userId, remove } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    const current = Array.isArray(workout.assignedTo) ? workout.assignedTo : [];
    workout.assignedTo = remove
      ? current.filter(id => id !== userId)
      : current.includes(userId) ? current : [...current, userId];
    await workout.save();
    if (!remove) {
      const user = await User.findByPk(userId);
      if (user) {
        const notif = await Notification.create({
          recipientId: userId, recipientModel: 'User',
          title: 'New Workout Plan Assigned',
          message: `A workout plan "${workout.title}" has been assigned to you by your trainer.`,
          type: 'system', actionUrl: '/user/workouts',
        });
        emitNotification(req.app.get('io'), 'User', userId, notif.toJSON());
      }
    }
    res.json({ success: true, message: remove ? 'Assignment removed' : 'Workout assigned', assignedTo: workout.assignedTo });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── NUTRITION MANAGEMENT ───────────────────────────────────────
router.get('/nutrition', ...adminAuth, async (req, res) => {
  try {
    const plans = await NutritionPlan.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, plans });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/nutrition', ...adminAuth, async (req, res) => {
  try {
    const plan = await NutritionPlan.create({ ...req.body, createdBy: req.user.id, creatorModel: 'Admin', isPublic: true });
    res.status(201).json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/nutrition/:id', ...adminAuth, async (req, res) => {
  try {
    await NutritionPlan.update(req.body, { where: { id: req.params.id } });
    const plan = await NutritionPlan.findByPk(req.params.id);
    res.json({ success: true, plan });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/nutrition/:id', ...adminAuth, async (req, res) => {
  try {
    await NutritionPlan.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/nutrition/:id/assign', ...adminAuth, async (req, res) => {
  try {
    const { userId, remove } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' });
    const plan = await NutritionPlan.findByPk(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    const current = Array.isArray(plan.assignedTo) ? plan.assignedTo : [];
    plan.assignedTo = remove
      ? current.filter(id => id !== userId)
      : current.includes(userId) ? current : [...current, userId];
    await plan.save();
    // Notify user
    if (!remove) {
      const user = await User.findByPk(userId);
      if (user) {
        const notif = await Notification.create({
          recipientId: userId, recipientModel: 'User',
          title: 'New Nutrition Plan Assigned',
          message: `A personalised nutrition plan "${plan.title}" has been assigned to you.`,
          type: 'system', actionUrl: '/user/nutrition',
        });
        emitNotification(req.app.get('io'), 'User', userId, notif.toJSON());
      }
    }
    res.json({ success: true, message: remove ? 'Assignment removed' : 'Plan assigned', assignedTo: plan.assignedTo });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PROGRAM MANAGEMENT ─────────────────────────────────────────
router.get('/programs', ...adminAuth, async (req, res) => {
  try {
    const programs = await Program.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, programs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/programs', ...adminAuth, async (req, res) => {
  try {
    const program = await Program.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, program });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/programs/:id', ...adminAuth, async (req, res) => {
  try {
    await Program.update(req.body, { where: { id: req.params.id } });
    const program = await Program.findByPk(req.params.id);
    res.json({ success: true, program });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/programs/:id', ...adminAuth, async (req, res) => {
  try {
    await Program.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Program deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BOOKINGS ───────────────────────────────────────────────────
router.get('/bookings', ...adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const bookings = await Booking.findAll({ where, order: [['createdAt', 'DESC']] });

    // Batch-load users and trainers — fixes N+1 query (was 2×N individual lookups)
    const userIds    = [...new Set(bookings.map(b => b.userId).filter(Boolean))];
    const trainerIds = [...new Set(bookings.map(b => b.trainerId).filter(Boolean))];

    const [users, trainers] = await Promise.all([
      User.findAll({ where: { id: userIds }, attributes: ['id','name','email','avatar'] }),
      Trainer.findAll({ where: { id: trainerIds }, attributes: ['id','name','avatar'] }),
    ]);

    const userMap    = Object.fromEntries(users.map(u => [u.id, u]));
    const trainerMap = Object.fromEntries(trainers.map(t => [t.id, t]));

    const enriched = bookings.map(b => ({
      ...b.toJSON(),
      user:    userMap[b.userId]    || null,
      trainer: trainerMap[b.trainerId] || null,
    }));

    res.json({ success: true, bookings: enriched });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PAYMENTS ───────────────────────────────────────────────────
router.get('/payments', ...adminAuth, async (req, res) => {
  try {
    const payments = await Payment.findAll({ order: [['createdAt', 'DESC']] });
    const enriched = await Promise.all(payments.map(async p => {
      const user = await User.findByPk(p.userId, { attributes: ['id','name','email'] });
      return { ...p.toJSON(), user };
    }));
    res.json({ success: true, payments: enriched });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── UPI SETTINGS ───────────────────────────────────────────────
router.get('/settings/upi', ...adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.id);
    res.json({ success: true, upiId: admin.upiId, upiName: admin.upiName });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/settings/upi', ...adminAuth, async (req, res) => {
  try {
    const { upiId, upiName } = req.body;
    if (!upiId) return res.status(400).json({ success: false, message: 'UPI ID required' });
    await Admin.update({ upiId, upiName: upiName || 'Mpower Fitness' }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'UPI settings updated', upiId, upiName });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ANALYTICS ─────────────────────────────────────────────────
router.get('/analytics', ...adminAuth, async (req, res) => {
  try {
    const now = new Date();
    // Last 6 months revenue
    const revenueData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const rev = await Payment.sum('amount', { where: { status: 'success', createdAt: { [Op.between]: [d, end] } } }) || 0;
      const cnt = await User.count({ where: { createdAt: { [Op.between]: [d, end] } } });
      revenueData.push({ month: d.toLocaleString('en', { month: 'short' }), revenue: rev, users: cnt });
    }
    res.json({ success: true, data: { revenueData } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;


// ── USER CRUD ──────────────────────────────────────────────────
router.put('/users/:id', ...adminAuth, async (req, res) => {
  try {
    const allowed = ['name','phone','fitnessGoal','fitnessLevel','subscriptionPlan','subscriptionActive','subscriptionEndDate','isActive'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    await User.update(updates, { where: { id: req.params.id } });
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password','refreshToken'] } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/users/:id', ...adminAuth, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PRICING / PLANS ────────────────────────────────────────────
router.get('/pricing', ...adminAuth, async (req, res) => {
  try {
    const programs = await Program.findAll({ where: { isActive: true }, order: [['createdAt','ASC']] });
    res.json({ success: true, programs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── BLOG MANAGEMENT ────────────────────────────────────────────
router.get('/blogs', ...adminAuth, async (req, res) => {
  try {
    const blogs = await Blog.findAll({ order: [['createdAt','DESC']] });
    res.json({ success:true, blogs });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

router.post('/blogs', ...adminAuth, async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, isPublished, isFeatured, readTime } = req.body;
    if (!title) return res.status(400).json({ success:false, message:'Title required' });
    // generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36);
    const blog = await Blog.create({
      title, slug, excerpt, content, category: category||'General',
      tags: tags||[], isPublished: !!isPublished, isFeatured: !!isFeatured,
      readTime: readTime||Math.ceil((content||'').split(' ').length/200)||5,
      authorId: req.user.id, authorName: req.user.name||'Mpower Team',
      publishedAt: isPublished ? new Date() : null,
    });
    res.status(201).json({ success:true, blog });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

router.put('/blogs/:id', ...adminAuth, async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, isPublished, isFeatured, readTime } = req.body;
    const blog = await Blog.findByPk(req.params.id);
    if (!blog) return res.status(404).json({ success:false, message:'Blog not found' });
    await blog.update({
      title: title||blog.title, excerpt, content, category: category||blog.category,
      tags: tags||blog.tags, isPublished: isPublished!==undefined ? !!isPublished : blog.isPublished,
      isFeatured: isFeatured!==undefined ? !!isFeatured : blog.isFeatured,
      readTime: readTime||blog.readTime,
      publishedAt: isPublished && !blog.publishedAt ? new Date() : blog.publishedAt,
    });
    res.json({ success:true, blog });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

router.delete('/blogs/:id', ...adminAuth, async (req, res) => {
  try {
    await Blog.destroy({ where:{ id:req.params.id } });
    res.json({ success:true, message:'Blog deleted' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

