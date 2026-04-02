/**
 * trainerService — Single Responsibility: all trainer business logic.
 *
 * Routes call this service; they do not touch models or send notifications directly.
 * To change how a trainer is approved, edit here — routes stay untouched.
 * Open/Closed: add new operations (e.g. suspend) without modifying existing methods.
 */
const { Trainer, User, Notification } = require('../models/index');
const { emitNotification } = require('../utils/socketHandler');

/**
 * Approve a trainer account and notify them.
 * @throws {Error} 404 if trainer not found
 */
const approve = async (trainerId, io) => {
  const trainer = await Trainer.findByPk(trainerId);
  if (!trainer) {
    const err = new Error('Trainer not found');
    err.statusCode = 404;
    throw err;
  }
  trainer.isApproved = true;
  await trainer.save();

  const notif = await Notification.create({
    recipientId: trainer.id, recipientModel: 'Trainer',
    title: 'Account Approved!',
    message: 'Your trainer account has been approved. You can now log in and start accepting clients.',
    type: 'system',
  });
  emitNotification(io, 'Trainer', trainer.id, notif.toJSON());

  return trainer;
};

/**
 * Reject a trainer application, deactivate the account, and notify them.
 * @throws {Error} 404 if trainer not found
 */
const reject = async (trainerId, reason, io) => {
  const trainer = await Trainer.findByPk(trainerId);
  if (!trainer) {
    const err = new Error('Trainer not found');
    err.statusCode = 404;
    throw err;
  }
  trainer.isApproved = false;
  trainer.isActive = false;
  await trainer.save();

  const notif = await Notification.create({
    recipientId: trainer.id, recipientModel: 'Trainer',
    title: 'Application Update',
    message: reason
      ? `Your trainer application was not approved. Reason: ${reason}`
      : 'Your trainer application was not approved at this time. You may reapply after addressing any concerns.',
    type: 'system',
  });
  emitNotification(io, 'Trainer', trainer.id, notif.toJSON());

  return trainer;
};

/**
 * Assign (or unassign) a trainer to a user.
 * Handles both sides of the relationship: user.assignedTrainerId and trainer.clients.
 * @throws {Error} 404 if user or trainer not found
 */
const assignToUser = async (userId, trainerId, io) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const previousTrainerId = user.assignedTrainerId;

  // Add to new trainer's client list
  if (trainerId) {
    const trainer = await Trainer.findByPk(trainerId);
    if (!trainer) {
      const err = new Error('Trainer not found');
      err.statusCode = 404;
      throw err;
    }
    const clients = trainer.clients || [];
    if (!clients.includes(userId)) {
      trainer.clients = [...clients, userId];
      await trainer.save();
    }
  }

  user.assignedTrainerId = trainerId || null;
  await user.save();

  // Remove from previous trainer's client list
  if (previousTrainerId && previousTrainerId !== trainerId) {
    const prev = await Trainer.findByPk(previousTrainerId);
    if (prev) {
      prev.clients = (prev.clients || []).filter(id => id !== userId);
      await prev.save();
    }
  }

  // Notify user
  const userNotif = await Notification.create({
    recipientId: user.id, recipientModel: 'User',
    title: trainerId ? 'Trainer Assigned to You' : 'Trainer Assignment Removed',
    message: trainerId
      ? 'A certified trainer has been assigned to your account and is ready to support your fitness journey.'
      : 'Your trainer assignment has been removed.',
    type: 'system',
  });
  emitNotification(io, 'User', user.id, userNotif.toJSON());

  // Notify new trainer
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
      if (io) io.to(`trainer_${trainerId}`).emit('new_client', { userId: user.id, userName: user.name });
    }
  }

  return user;
};

module.exports = { approve, reject, assignToUser };
