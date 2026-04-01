const { Op } = require('sequelize');
const { Workout, WorkoutSession, User } = require('../models/index');
const { checkAndAwardBadges, updateStreak } = require('../utils/gamification');

const getWorkouts = async (req, res) => {
  try {
    const { category, difficulty, search, limit = 50, page = 1, featured } = req.query;
    const where = { isPublic: true };
    if (category && category !== 'all') where.category = category;
    if (difficulty && difficulty !== 'all') where.difficulty = difficulty;
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Workout.findAndCountAll({
      where,
      order: [['isFeatured', 'DESC'], ['completions', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({ success: true, workouts: rows, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      createdBy: req.user.id,
      creatorModel: req.userRole === 'trainer' ? 'Trainer' : 'Admin',
    });
    res.status(201).json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByPk(req.params.id);
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    await workout.update(req.body);
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    await Workout.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logSession = async (req, res) => {
  try {
    const { workoutId, workoutName, duration, caloriesBurned, exercisesCompleted, notes, mood, completionRate } = req.body;

    const session = await WorkoutSession.create({
      userId: req.user.id,
      workoutId: workoutId || null,
      workoutName: workoutName || 'Custom Workout',
      startTime: req.body.startTime || new Date(),
      endTime: req.body.endTime || new Date(),
      duration: duration || 0,
      caloriesBurned: caloriesBurned || 0,
      exercisesCompleted: exercisesCompleted || [],
      notes,
      mood,
      completionRate: completionRate || 100,
    });

    // Update workout stats
    if (workoutId) {
      await Workout.increment('completions', { where: { id: workoutId } });
    }

    // Update user stats
    await User.increment(
      { totalWorkouts: 1, totalCaloriesBurned: caloriesBurned || 0 },
      { where: { id: req.user.id } }
    );

    const io = req.app.get('io');
    const newStreak = await updateStreak(req.user.id);
    const newBadges = await checkAndAwardBadges(io, req.user.id, { caloriesBurned, newStreak });

    res.status(201).json({ success: true, session, newStreak, newBadges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMySessions = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const sessions = await WorkoutSession.findAll({
      where: { userId: req.user.id },
      order: [['startTime', 'DESC']],
      limit: parseInt(limit),
    });
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout, logSession, getMySessions };
