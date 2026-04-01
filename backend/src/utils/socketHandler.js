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

module.exports = { socketHandler };
