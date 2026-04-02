const express = require('express');
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const { User } = require('../models/index');
const {
  getWorkouts, getWorkout, createWorkout, updateWorkout,
  deleteWorkout, logSession, getMySessions,
} = require('../controllers/workoutController');

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const JWT_SECRET = process.env.JWT_SECRET || 'mpower_jwt_secret_dev_key_min_64_chars_long_enough';
      const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
      if (decoded.role === 'user') {
        const user = await User.findByPk(decoded.id);
        if (user && user.isActive) req.user = user;
      }
    }
  } catch (_) {}
  next();
};

router.get('/', optionalAuth, getWorkouts);
router.get('/sessions/my', protect, getMySessions);
router.get('/:id', getWorkout);
router.post('/', protect, authorize('trainer', 'admin', 'superadmin'), createWorkout);
router.put('/:id', protect, authorize('trainer', 'admin', 'superadmin'), updateWorkout);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteWorkout);
router.post('/sessions/log', protect, authorize('user'), logSession);

module.exports = router;
