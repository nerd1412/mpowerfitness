const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAvailability, createBooking, getMyBookings,
  getTrainerSchedule, updateBookingStatus, cancelBooking, rateBooking,
} = require('../controllers/bookingController');

const router = express.Router();
router.use(protect);

router.get('/trainer/:trainerId/availability', getAvailability);
router.post('/', authorize('user'), createBooking);
router.get('/my', getMyBookings);
router.get('/trainer-schedule', authorize('trainer'), getTrainerSchedule);
router.patch('/:id/status', authorize('trainer', 'admin', 'superadmin'), updateBookingStatus);
router.patch('/:id/cancel', authorize('user'), cancelBooking);
router.post('/:id/rate', authorize('user'), rateBooking);

module.exports = router;
