const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getWorkouts, getWorkout, createWorkout, updateWorkout,
  deleteWorkout, logSession, getMySessions,
} = require('../controllers/workoutController');

const router = express.Router();

router.get('/', getWorkouts);
router.get('/sessions/my', protect, getMySessions);
router.get('/:id', getWorkout);
router.post('/', protect, authorize('trainer', 'admin', 'superadmin'), createWorkout);
router.put('/:id', protect, authorize('trainer', 'admin', 'superadmin'), updateWorkout);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteWorkout);
router.post('/sessions/log', protect, authorize('user'), logSession);

module.exports = router;
