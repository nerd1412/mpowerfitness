/**
 * notificationService — Single Responsibility: creating and emitting notifications.
 * Routes call this instead of creating Notification records inline.
 * Centralising here means changing the notification system is a single-file edit.
 */
const { Notification } = require('../models/index');
const { emitNotification } = require('../utils/socketHandler');

/**
 * Create a notification record and emit it over socket.io.
 *
 * @param {object} io         - Socket.io server instance (from req.app.get('io'))
 * @param {string} recipientModel - 'User' | 'Trainer' | 'Admin'
 * @param {string} recipientId
 * @param {object} payload    - { title, message, type, actionUrl?, data? }
 * @returns {Promise<object>} The created notification's JSON
 */
const send = async (io, recipientModel, recipientId, payload) => {
  const notif = await Notification.create({
    recipientId,
    recipientModel,
    title:     payload.title,
    message:   payload.message,
    type:      payload.type || 'system',
    actionUrl: payload.actionUrl || null,
    data:      payload.data ? JSON.stringify(payload.data) : null,
    isRead:    false,
  });
  emitNotification(io, recipientModel, recipientId, notif.toJSON());
  return notif.toJSON();
};

module.exports = { send };
