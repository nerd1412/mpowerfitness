const { bookingsRouter, paymentsRouter, workoutsRouter, progressRouter, programsRouter, usersRouter, trainersRouter, notificationsRouter, nutritionRouter, chatRouter } = require('./allRoutes');

// Export each router for server.js registration
module.exports = {
  users: usersRouter,
  trainers: trainersRouter,
  bookings: bookingsRouter,
  payments: paymentsRouter,
  workouts: workoutsRouter,
  progress: progressRouter,
  programs: programsRouter,
  notifications: notificationsRouter,
  nutrition: nutritionRouter,
  chat: chatRouter
};
