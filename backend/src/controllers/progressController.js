const { Progress, WorkoutSession } = require('../models/index');
const { Op } = require('sequelize');

const getMyProgress = async (req, res) => {
  try {
    const { limit = 30, from, to } = req.query;
    const where = { userId: req.user.id };
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }

    const progress = await Progress.findAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
    });

    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const logProgress = async (req, res) => {
  try {
    const { date, weight, bodyFat, muscleMass, measurements, caloriesConsumed, caloriesBurned, waterIntake, sleepHours, mood, energyLevel, notes } = req.body;

    // Upsert — one entry per day
    const [entry, created] = await Progress.findOrCreate({
      where: { userId: req.user.id, date: date || new Date().toISOString().split('T')[0] },
      defaults: { userId: req.user.id },
    });

    if (weight !== undefined) entry.weight = weight;
    if (bodyFat !== undefined) entry.bodyFat = bodyFat;
    if (muscleMass !== undefined) entry.muscleMass = muscleMass;
    if (measurements !== undefined) entry.measurements = measurements;
    if (caloriesConsumed !== undefined) entry.caloriesConsumed = caloriesConsumed;
    if (caloriesBurned !== undefined) entry.caloriesBurned = caloriesBurned;
    if (waterIntake !== undefined) entry.waterIntake = waterIntake;
    if (sleepHours !== undefined) entry.sleepHours = sleepHours;
    if (mood !== undefined) entry.mood = mood;
    if (energyLevel !== undefined) entry.energyLevel = energyLevel;
    if (notes !== undefined) entry.notes = notes;

    await entry.save();
    res.status(created ? 201 : 200).json({ success: true, progress: entry, created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProgress = async (req, res) => {
  try {
    const entry = await Progress.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.destroy();
    res.json({ success: true, message: 'Progress entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await Progress.findAll({
      where: { userId },
      order: [['date', 'ASC']],
      limit: 90,
    });

    const sessions = await WorkoutSession.findAll({
      where: { userId },
      order: [['startTime', 'DESC']],
      limit: 30,
    });

    const latest = progress[progress.length - 1];
    const earliest = progress[0];

    res.json({
      success: true,
      stats: {
        weightChange:
          latest?.weight && earliest?.weight
            ? +(latest.weight - earliest.weight).toFixed(1)
            : null,
        latestWeight: latest?.weight || null,
        latestBodyFat: latest?.bodyFat || null,
        totalSessions: sessions.length,
        avgCaloriesBurned: sessions.length
          ? Math.round(sessions.reduce((s, x) => s + (x.caloriesBurned || 0), 0) / sessions.length)
          : 0,
        progressEntries: progress.length,
      },
      recentSessions: sessions.slice(0, 7),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyProgress, logProgress, deleteProgress, getStats };
