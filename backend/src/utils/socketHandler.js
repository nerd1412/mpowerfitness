const socketHandler = (io) => {
  io.on('connection', (socket) => {
    // Join personal room on auth
    socket.on('authenticate', ({ userId, role }) => {
      if (userId) {
        socket.join(`user_${userId}`);
        if (role === 'trainer') socket.join(`trainer_${userId}`);
        if (role === 'admin' || role === 'superadmin') socket.join('admin_room');
      }
    });

    // Join conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) socket.join(`conv_${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) socket.leave(`conv_${conversationId}`);
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', { userId, isTyping });
    });

    // Message read receipt
    socket.on('mark_read', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('message_read', { conversationId, userId, readAt: new Date() });
    });

    socket.on('disconnect', () => {});
  });
};

/**
 * Emit a real-time notification to the appropriate socket room.
 * @param {Object} io - Socket.io server instance
 * @param {string} recipientModel - 'User' | 'Trainer' | 'Admin'
 * @param {string} recipientId - recipient UUID
 * @param {Object} notification - the created Notification record (toJSON)
 */
const emitNotification = (io, recipientModel, recipientId, notification) => {
  if (!io) return;
  try {
    if (recipientModel === 'Admin') {
      io.to('admin_room').emit('new_notification', notification);
    } else if (recipientModel === 'Trainer') {
      io.to(`trainer_${recipientId}`).emit('new_notification', notification);
    } else {
      io.to(`user_${recipientId}`).emit('new_notification', notification);
    }
  } catch (_) {}
};

module.exports = { socketHandler, emitNotification };
