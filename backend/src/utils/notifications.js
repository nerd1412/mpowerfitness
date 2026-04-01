const { Notification } = require('../models/index');

/**
 * Create a notification for a user/trainer/admin
 */
const createNotification = async ({ recipientId, recipientModel, title, message, type, data, actionUrl }) => {
  try {
    const notification = await Notification.create({
      recipientId,
      recipientModel,
      title,
      message,
      type: type || 'system',
      data,
      actionUrl
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Emit notification via Socket.IO to specific user
 */
const emitNotification = (io, userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
};

/**
 * Create + emit notification together
 */
const notify = async (io, { recipientId, recipientModel, title, message, type, data, actionUrl }) => {
  const notification = await createNotification({ recipientId, recipientModel, title, message, type, data, actionUrl });
  if (notification && io) {
    emitNotification(io, recipientId, notification);
  }
  return notification;
};

/**
 * Booking-specific notifications
 */
const notifyBookingConfirmed = async (io, userId, trainerName, sessionDate) => {
  return notify(io, {
    recipientId: userId,
    recipientModel: 'User',
    title: '✅ Booking Confirmed!',
    message: `Your session with ${trainerName} on ${new Date(sessionDate).toLocaleDateString('en-IN')} has been confirmed.`,
    type: 'booking_confirmed'
  });
};

const notifyNewBooking = async (io, trainerId, userName, sessionDate, startTime) => {
  return notify(io, {
    recipientId: trainerId,
    recipientModel: 'Trainer',
    title: '📅 New Session Request',
    message: `${userName} has requested a session on ${new Date(sessionDate).toLocaleDateString('en-IN')} at ${startTime}.`,
    type: 'new_client'
  });
};

const notifyAchievement = async (io, userId, badgeName, badgeIcon) => {
  return notify(io, {
    recipientId: userId,
    recipientModel: 'User',
    title: `${badgeIcon} Achievement Unlocked!`,
    message: `You've earned the "${badgeName}" badge. Keep it up! 🏆`,
    type: 'achievement_earned'
  });
};

module.exports = {
  createNotification,
  emitNotification,
  notify,
  notifyBookingConfirmed,
  notifyNewBooking,
  notifyAchievement
};
