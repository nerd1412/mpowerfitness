const { Op } = require('sequelize');
const { Booking, Payment, User, Trainer, Notification } = require('../models/index');
const { checkAndAwardBadges } = require('../utils/gamification');

const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    const trainer = await Trainer.findByPk(req.params.trainerId, {
      attributes: ['id', 'name', 'availability', 'sessionRate', 'isApproved'],
    });
    if (!trainer) return res.status(404).json({ success: false, message: 'Trainer not found' });

    const bookedSlots = date
      ? await Booking.findAll({
          where: {
            trainerId: req.params.trainerId,
            sessionDate: date,
            status: { [Op.in]: ['pending', 'confirmed'] },
          },
          attributes: ['startTime', 'endTime'],
        })
      : [];

    res.json({
      success: true,
      availability: trainer.availability,
      trainer: { name: trainer.name, sessionRate: trainer.sessionRate },
      bookedSlots,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const { trainerId, sessionDate, startTime, endTime, sessionType, notes } = req.body;
    const trainer = await Trainer.findByPk(trainerId);
    if (!trainer || !trainer.isApproved)
      return res.status(404).json({ success: false, message: 'Trainer not found or not approved' });

    const conflict = await Booking.findOne({
      where: { trainerId, sessionDate, startTime, status: { [Op.in]: ['pending', 'confirmed'] } },
    });
    if (conflict)
      return res.status(400).json({ success: false, message: 'This slot is already booked' });

    const booking = await Booking.create({
      userId: req.user.id,
      trainerId,
      sessionDate,
      startTime,
      endTime: endTime || startTime,
      sessionType: sessionType || 'online',
      amount: trainer.sessionRate,
      notes,
    });

    await Notification.create({
      recipientId: trainerId,
      recipientModel: 'Trainer',
      title: 'New Session Booking',
      message: `${req.user.name} has requested a session on ${sessionDate} at ${startTime}`,
      type: 'new_client',
      data: JSON.stringify({ bookingId: booking.id }),
    });

    const io = req.app.get('io');
    if (io) io.to(`trainer_${trainerId}`).emit('new_booking', { booking: booking.toJSON() });

    // Award first-booking badge
    await checkAndAwardBadges(io, req.user.id);

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (status && status !== 'all') where.status = status;

    const bookings = await Booking.findAll({
      where,
      order: [['sessionDate', 'DESC'], ['startTime', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const trainer = await Trainer.findByPk(b.trainerId, {
          attributes: ['id', 'name', 'avatar', 'specializations', 'rating', 'upiId'],
        });
        return { ...b.toJSON(), trainer };
      })
    );
    res.json({ success: true, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTrainerSchedule = async (req, res) => {
  try {
    const { status, date } = req.query;
    const where = { trainerId: req.user.id };
    if (status && status !== 'all') where.status = status;
    if (date) where.sessionDate = date;

    const bookings = await Booking.findAll({
      where,
      order: [['sessionDate', 'ASC'], ['startTime', 'ASC']],
    });

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const user = await User.findByPk(b.userId, {
          attributes: ['id', 'name', 'avatar', 'email', 'phone', 'fitnessGoal'],
        });
        return { ...b.toJSON(), user };
      })
    );
    res.json({ success: true, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status, trainerNotes, cancellationReason } = req.body;
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Trainers can only update their own bookings
    if (req.userRole === 'trainer' && booking.trainerId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    booking.status = status;
    if (trainerNotes) booking.trainerNotes = trainerNotes;
    if (cancellationReason) {
      booking.cancellationReason = cancellationReason;
      booking.cancelledBy = req.userRole;
    }
    await booking.save();

    const user = await User.findByPk(booking.userId);
    const notifMap = {
      confirmed: {
        title: 'Booking Confirmed!',
        message: `Your session on ${booking.sessionDate} at ${booking.startTime} is confirmed.`,
        type: 'booking_confirmed',
      },
      cancelled: {
        title: 'Booking Cancelled',
        message: `Your session on ${booking.sessionDate} was cancelled.`,
        type: 'booking_cancelled',
      },
      completed: {
        title: 'Session Completed',
        message: `Your session has been marked as completed.`,
        type: 'system',
      },
    };
    if (notifMap[status] && user) {
      await Notification.create({
        recipientId: user.id,
        recipientModel: 'User',
        ...notifMap[status],
      });
      const io = req.app.get('io');
      if (io) io.to(`user_${user.id}`).emit('booking_update', { bookingId: booking.id, status });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    booking.cancelledBy = 'user';
    await booking.save();

    // Notify trainer
    await Notification.create({
      recipientId: booking.trainerId,
      recipientModel: 'Trainer',
      title: 'Booking Cancelled',
      message: `A session on ${booking.sessionDate} at ${booking.startTime} was cancelled by the client.`,
      type: 'booking_cancelled',
    });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rateBooking = async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be 1–5' });

    const booking = await Booking.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!booking || booking.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Can only rate completed sessions' });
    if (booking.rating)
      return res.status(400).json({ success: false, message: 'Already rated' });

    booking.rating = rating;
    booking.review = review;
    await booking.save();

    // Update trainer average rating
    const trainer = await Trainer.findByPk(booking.trainerId);
    if (trainer) {
      const newTotal = (trainer.totalRatings || 0) + 1;
      trainer.rating = (trainer.rating * (trainer.totalRatings || 0) + rating) / newTotal;
      trainer.totalRatings = newTotal;
      await trainer.save();
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAvailability,
  createBooking,
  getMyBookings,
  getTrainerSchedule,
  updateBookingStatus,
  cancelBooking,
  rateBooking,
};
