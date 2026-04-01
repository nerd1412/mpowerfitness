const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { User, WorkoutSession, Booking, Trainer } = require('../models/index');

const router = express.Router();
router.use(protect);

router.get('/dashboard', authorize('user'), async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'refreshToken'] } });
    const assignedTrainer = user.assignedTrainerId
      ? await Trainer.findByPk(user.assignedTrainerId, { attributes: ['id', 'name', 'avatar', 'rating', 'specializations'] })
      : null;

    const recentSessions = await WorkoutSession.findAll({
      where: { userId: req.user.id }, order: [['startTime', 'DESC']], limit: 7,
    });

    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const weeklySessions = await WorkoutSession.findAll({
      where: { userId: req.user.id, startTime: { [require('sequelize').Op.gte]: weekStart } },
    });

    // Build weekly chart data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const daySessions = weeklySessions.filter(s => {
        const t = new Date(s.startTime);
        return t >= d && t <= end;
      });
      return { day: days[d.getDay()], cal: daySessions.reduce((s, x) => s + (x.caloriesBurned || 0), 0), sessions: daySessions.length };
    });

    res.json({
      success: true,
      data: {
        user: { ...user.toJSON(), assignedTrainer },
        recentSessions,
        weeklyChart,
        subscription: { plan: user.subscriptionPlan, isActive: user.subscriptionActive, endDate: user.subscriptionEndDate },
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'refreshToken'] } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/profile', authorize('user'), async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'age', 'gender', 'height', 'weight', 'targetWeight', 'fitnessGoal', 'fitnessLevel', 'lifestyle', 'preferredWorkoutTime', 'workoutDaysPerWeek', 'city', 'state'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await User.update(updates, { where: { id: req.user.id } });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password', 'refreshToken'] } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
