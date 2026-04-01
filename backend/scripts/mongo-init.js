// MongoDB initialization script
// This runs when the container first starts

db = db.getSiblingDB('mpower_fitness');

// Create collections
db.createCollection('users');
db.createCollection('trainers');
db.createCollection('admins');
db.createCollection('workouts');
db.createCollection('bookings');
db.createCollection('payments');
db.createCollection('programs');
db.createCollection('nutritionplans');
db.createCollection('notifications');

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.trainers.createIndex({ email: 1 }, { unique: true });
db.admins.createIndex({ email: 1 }, { unique: true });
db.bookings.createIndex({ user: 1, sessionDate: 1 });
db.bookings.createIndex({ trainer: 1, sessionDate: 1 });
db.workouts.createIndex({ category: 1, difficulty: 1 });
db.notifications.createIndex({ recipient: 1, isRead: 1 });
db.workoutsessions.createIndex({ user: 1, createdAt: -1 });
db.progress.createIndex({ user: 1, date: -1 });

print('✅ Mpower Fitness database initialized successfully');
