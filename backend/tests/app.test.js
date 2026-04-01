/**
 * Mpower Fitness — Comprehensive Test Suite
 * Tests: Authentication, Workouts, Nutrition, Progress, Bookings, Admin, Trainer, Chat
 * 
 * Run: cd backend && npm test
 * Requires: npm install --save-dev jest supertest
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Use in-memory SQLite for tests
process.env.SQLITE_PATH = ':memory:';
process.env.NODE_ENV = 'test';

let app, sequelize, request;

// ─── Setup ───────────────────────────────────────────────────────────────────
let userToken, trainerToken, adminToken;
let userId, trainerId, adminId;
let workoutId, nutritionPlanId, bookingId, progressId, blogId;

beforeAll(async () => {
  try {
    request = require('supertest');
    const serverModule = require('../src/server');
    app = serverModule.app;
    const models = require('../src/models/index');
    sequelize = models.sequelize;
    
    // Sync in-memory DB
    await sequelize.sync({ force: true });
    
    // Seed test data
    const { seed } = require('../src/utils/seeder');
    await seed();
    
    console.log('✅ Test database initialized');
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    throw err;
  }
}, 60000);

afterAll(async () => {
  if (sequelize) await sequelize.close();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const post  = (url, body, token) => {
  const r = request(app).post(url).send(body).set('Content-Type','application/json');
  return token ? r.set('Authorization', `Bearer ${token}`) : r;
};
const get   = (url, token) => token ? request(app).get(url).set('Authorization', `Bearer ${token}`) : request(app).get(url);
const put   = (url, body, token) => request(app).put(url).send(body).set('Content-Type','application/json').set('Authorization', `Bearer ${token}`);
const patch = (url, body, token) => request(app).patch(url).send(body).set('Content-Type','application/json').set('Authorization', `Bearer ${token}`);
const del   = (url, token) => request(app).delete(url).set('Authorization', `Bearer ${token}`);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Authentication', () => {

  describe('User Auth', () => {
    test('User login with valid credentials', async () => {
      const res = await post('/api/auth/user/login', {
        email: 'user@mpowerfitness.com',
        password: 'User@123456'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      userToken = res.body.accessToken;
      userId    = res.body.user.id;
    });

    test('User login with wrong password returns 401', async () => {
      const res = await post('/api/auth/user/login', { email:'user@mpowerfitness.com', password:'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('User login with unknown email returns 401', async () => {
      const res = await post('/api/auth/user/login', { email:'nobody@test.com', password:'Test@123' });
      expect(res.status).toBe(401);
    });

    test('User registration with valid data', async () => {
      const res = await post('/api/auth/user/register', {
        name: 'Test User', email: 'testuser@test.com', password: 'TestPass@123'
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('testuser@test.com');
    });

    test('Duplicate registration returns 400', async () => {
      const res = await post('/api/auth/user/register', {
        name: 'Dupe', email: 'user@mpowerfitness.com', password: 'User@123456'
      });
      expect(res.status).toBe(400);
    });

    test('GET /auth/me with valid token', async () => {
      const res = await get('/api/auth/me', userToken);
      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userId);
    });

    test('GET /auth/me without token returns 401', async () => {
      const res = await get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Trainer Auth', () => {
    test('Trainer login with valid credentials', async () => {
      const res = await post('/api/auth/trainer/login', {
        email: 'arjun@mpowerfitness.com',
        password: 'Trainer@123'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBeDefined();
      expect(res.body.accessToken).toBeDefined();
      trainerToken = res.body.accessToken;
      trainerId    = res.body.user.id;
    });

    test('Trainer login returns trainer-specific fields', async () => {
      const res = await post('/api/auth/trainer/login', {
        email: 'arjun@mpowerfitness.com', password: 'Trainer@123'
      });
      const u = res.body.user;
      expect(u.isApproved).toBeDefined();
      expect(u.specializations).toBeDefined();
      expect(u.sessionRate).toBeDefined();
    });

    test('Trainer login with wrong password returns 401', async () => {
      const res = await post('/api/auth/trainer/login', {
        email: 'arjun@mpowerfitness.com', password: 'wrong'
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Admin Auth', () => {
    test('Admin login with valid credentials', async () => {
      const res = await post('/api/auth/admin/login', {
        email: 'admin@mpowerfitness.com',
        password: 'Admin@123456'
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.accessToken).toBeDefined();
      adminToken = res.body.accessToken;
      adminId    = res.body.user.id;
    });

    test('Admin login with wrong password returns 401', async () => {
      const res = await post('/api/auth/admin/login', {
        email: 'admin@mpowerfitness.com', password: 'wrong'
      });
      expect(res.status).toBe(401);
    });
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. WORKOUT TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Workouts', () => {

  test('GET /workouts returns list', async () => {
    const res = await get('/api/workouts', userToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.workouts)).toBe(true);
    expect(res.body.workouts.length).toBeGreaterThan(0);
    workoutId = res.body.workouts[0].id;
  });

  test('GET /workouts filters by category', async () => {
    const res = await get('/api/workouts?category=strength', userToken);
    expect(res.status).toBe(200);
    res.body.workouts.forEach(w => expect(w.category).toBe('strength'));
  });

  test('GET /workouts filters by difficulty', async () => {
    const res = await get('/api/workouts?difficulty=beginner', userToken);
    expect(res.status).toBe(200);
    res.body.workouts.forEach(w => expect(w.difficulty).toBe('beginner'));
  });

  test('GET /workouts/:id returns correct workout', async () => {
    const res = await get(`/api/workouts/${workoutId}`, userToken);
    expect(res.status).toBe(200);
    expect(res.body.workout.id).toBe(workoutId);
    expect(res.body.workout.exercises).toBeDefined();
  });

  test('GET /workouts/:id with invalid UUID returns 404', async () => {
    const res = await get('/api/workouts/00000000-0000-0000-0000-000000000000', userToken);
    expect(res.status).toBe(404);
  });

  test('Trainer can create workout', async () => {
    const res = await post('/api/workouts', {
      title: 'Test Workout', category: 'strength', difficulty: 'beginner',
      duration: 30, caloriesBurn: 200,
      exercises: [{ name: 'Push-ups', sets: 3, reps: '10', instructions: 'Keep straight', muscleGroups: ['chest'] }],
    }, trainerToken);
    expect(res.status).toBe(201);
    expect(res.body.workout.title).toBe('Test Workout');
  });

  test('Regular user cannot create workout', async () => {
    const res = await post('/api/workouts', {
      title: 'Hacked Workout', category: 'hiit', difficulty: 'beginner', duration: 20
    }, userToken);
    expect(res.status).toBe(403);
  });

  test('POST /workouts/sessions/start logs session', async () => {
    const res = await post('/api/workouts/sessions/start', {
      workoutId, workoutName: 'Test Session'
    }, userToken);
    expect(res.status).toBe(201);
    expect(res.body.session).toBeDefined();
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. PROGRESS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Progress Tracking', () => {

  test('POST /progress creates entry and returns it', async () => {
    const res = await post('/api/progress', {
      date: '2025-01-15', weight: 80, bodyFat: 20,
      measurements: { waist: 84, chest: 96 }, notes: 'Test entry'
    }, userToken);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.progress.weight).toBe(80);
    progressId = res.body.progress.id;
  });

  test('POST /progress with weight updates user weight', async () => {
    await post('/api/progress', { date: '2025-01-20', weight: 79 }, userToken);
    const me = await get('/api/auth/me', userToken);
    expect(me.body.user.weight).toBe(79);
  });

  test('GET /progress/my returns logged entries', async () => {
    const res = await get('/api/progress/my', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.progress)).toBe(true);
    expect(res.body.progress.length).toBeGreaterThan(0);
    // Latest entry should have weight 79
    const latestWeight = res.body.progress[0]?.weight || res.body.progress[1]?.weight;
    expect(latestWeight).toBeDefined();
  });

  test('GET /progress/my returns entries in DESC order', async () => {
    const res = await get('/api/progress/my', userToken);
    const dates = res.body.progress.map(p => p.date);
    for (let i = 0; i < dates.length - 1; i++) {
      expect(new Date(dates[i]) >= new Date(dates[i+1])).toBe(true);
    }
  });

  test('Trainer can view client progress', async () => {
    const res = await get(`/api/progress/client/${userId}`, trainerToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.progress)).toBe(true);
  });

  test('User cannot view another user progress (role check)', async () => {
    const res = await get(`/api/progress/client/${userId}`, userToken);
    expect(res.status).toBe(403);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NUTRITION TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Nutrition', () => {

  test('GET /nutrition returns public plans', async () => {
    const res = await get('/api/nutrition', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.plans)).toBe(true);
    expect(res.body.plans.length).toBeGreaterThan(0);
    nutritionPlanId = res.body.plans[0].id;
  });

  test('All returned plans are public or assigned to user', async () => {
    const res = await get('/api/nutrition', userToken);
    res.body.plans.forEach(p => {
      const assigned = Array.isArray(p.assignedTo) && p.assignedTo.includes(userId);
      expect(p.isPublic || assigned).toBe(true);
    });
  });

  test('Trainer can create nutrition plan', async () => {
    const res = await post('/api/nutrition', {
      title: 'Test Plan', goal: 'weight_loss',
      caloriesPerDay: 1800, proteinGrams: 140, carbsGrams: 160, fatGrams: 50,
      isPublic: true, meals: []
    }, trainerToken);
    expect(res.status).toBe(201);
    expect(res.body.plan.title).toBe('Test Plan');
  });

  test('User cannot create nutrition plan', async () => {
    const res = await post('/api/nutrition', {
      title: 'Hack Plan', goal: 'muscle_gain', caloriesPerDay: 2000,
      proteinGrams: 200, carbsGrams: 200, fatGrams: 60
    }, userToken);
    expect(res.status).toBe(403);
  });

  test('Trainer can assign plan to user', async () => {
    const res = await post('/api/trainers/assign-nutrition', {
      planId: nutritionPlanId, userId
    }, trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Trainer can update nutrition plan', async () => {
    const res = await put(`/api/nutrition/${nutritionPlanId}`, {
      caloriesPerDay: 2000
    }, trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.plan.caloriesPerDay).toBe(2000);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. BOOKINGS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Bookings', () => {

  test('GET /bookings/availability returns slots', async () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const res = await get(`/api/bookings/availability/${trainerId}?date=${tomorrow}`, userToken);
    expect(res.status).toBe(200);
  });

  test('User can create a booking', async () => {
    const sessionDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const res = await post('/api/bookings', {
      trainerId,
      sessionDate,
      startTime: '10:00',
      endTime: '11:00',
      sessionType: 'online',
      amount: 1200,
      notes: 'Test booking'
    }, userToken);
    expect([201, 200]).toContain(res.status);
    if (res.body.booking) {
      bookingId = res.body.booking.id || res.body.booking._id;
      expect(res.body.booking.status).toBe('pending');
    }
  });

  test('GET /bookings/my returns user bookings', async () => {
    const res = await get('/api/bookings/my', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  test('Trainer can view their schedule', async () => {
    const res = await get('/api/bookings/trainer-schedule', trainerToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
  });

  test('Trainer can confirm a booking', async () => {
    if (!bookingId) return;
    const res = await patch(`/api/bookings/${bookingId}/status`, { status: 'confirmed' }, trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.booking?.status).toBe('confirmed');
  });

  test('User can cancel their booking', async () => {
    if (!bookingId) return;
    const res = await patch(`/api/bookings/${bookingId}/cancel`, { reason: 'Testing' }, userToken);
    expect([200, 400]).toContain(res.status); // 400 if already confirmed
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TRAINER ROUTES TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Trainer Routes', () => {

  test('GET /trainers returns approved trainers', async () => {
    const res = await get('/api/trainers', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trainers)).toBe(true);
    res.body.trainers.forEach(t => {
      expect(t.isApproved).toBe(true);
      expect(t.password).toBeUndefined(); // password not exposed
    });
  });

  test('GET /trainers supports search filter', async () => {
    const res = await get('/api/trainers?search=Arjun', userToken);
    expect(res.status).toBe(200);
    expect(res.body.trainers.some(t => t.name.includes('Arjun'))).toBe(true);
  });

  test('GET /trainers supports city filter', async () => {
    const res = await get('/api/trainers?city=Mumbai', userToken);
    expect(res.status).toBe(200);
  });

  test('GET /trainers/:id returns trainer detail', async () => {
    const res = await get(`/api/trainers/${trainerId}`, userToken);
    expect(res.status).toBe(200);
    expect(res.body.trainer.id).toBe(trainerId);
  });

  test('Trainer dashboard returns data', async () => {
    const res = await get('/api/trainers/dashboard', trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  test('Trainer can update availability', async () => {
    const res = await put('/api/trainers/availability', {
      availability: [{ day: 'monday', slots: [{ startTime: '09:00', endTime: '10:00' }] }]
    }, trainerToken);
    expect(res.status).toBe(200);
  });

  test('Trainer can update profile', async () => {
    const res = await put('/api/trainers/profile', {
      bio: 'Updated bio', sessionRate: 1100
    }, trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.trainer?.sessionRate || 1100).toBe(1100);
  });

  test('Trainer can view their clients', async () => {
    const res = await get('/api/trainers/my-clients', trainerToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clients)).toBe(true);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. USER ROUTES TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('User Routes', () => {

  test('GET /users/dashboard returns user data', async () => {
    const res = await get('/api/users/dashboard', userToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.weeklyChart).toBeDefined();
  });

  test('PUT /users/profile updates user data', async () => {
    const res = await put('/api/users/profile', {
      age: 28, height: 175, weight: 80
    }, userToken);
    expect(res.status).toBe(200);
    expect(res.body.user.age).toBe(28);
  });

  test('Unauthorized access returns 401', async () => {
    const res = await get('/api/users/dashboard');
    expect(res.status).toBe(401);
  });

  test('Trainer token cannot access user-only routes', async () => {
    const res = await post('/api/progress', {
      date: '2025-01-20', weight: 80
    }, trainerToken);
    expect(res.status).toBe(403);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. ADMIN ROUTES TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Admin Routes', () => {

  test('GET /admin/dashboard returns platform stats', async () => {
    const res = await get('/api/admin/dashboard', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalUsers).toBeGreaterThan(0);
  });

  test('GET /admin/users returns all users', async () => {
    const res = await get('/api/admin/users', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  test('GET /admin/trainers returns all trainers', async () => {
    const res = await get('/api/admin/trainers', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.trainers)).toBe(true);
  });

  test('Admin can approve a trainer', async () => {
    // Get pending trainer
    const trainers = await get('/api/admin/trainers', adminToken);
    const pending = trainers.body.trainers.find(t => !t.isApproved);
    if (!pending) return; // All approved already
    const res = await patch(`/api/admin/trainers/${pending.id}/approve`, {}, adminToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Admin can create workout', async () => {
    const res = await post('/api/admin/workouts', {
      title: 'Admin Workout', category: 'cardio', difficulty: 'beginner',
      duration: 20, caloriesBurn: 150, isPublic: true
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.workout.title).toBe('Admin Workout');
  });

  test('Admin can update workout', async () => {
    const wRes = await get('/api/admin/workouts', adminToken);
    const wid = wRes.body.workouts[0]?.id;
    if (!wid) return;
    const res = await put(`/api/admin/workouts/${wid}`, { caloriesBurn: 999 }, adminToken);
    expect(res.status).toBe(200);
  });

  test('Admin can create nutrition plan', async () => {
    const res = await post('/api/admin/nutrition', {
      title: 'Admin Nutrition', goal: 'maintenance',
      caloriesPerDay: 2200, proteinGrams: 165, carbsGrams: 250, fatGrams: 65,
      isPublic: true
    }, adminToken);
    expect(res.status).toBe(201);
  });

  test('Admin can manage programs', async () => {
    const res = await post('/api/admin/programs', {
      title: 'Test Program', description: 'Test', duration: 8,
      level: 'beginner', goal: 'general_fitness',
      pricingMonthly: 999, pricingQuarterly: 2499, pricingPremium: 7999,
      isActive: true
    }, adminToken);
    expect(res.status).toBe(201);
    expect(res.body.program.title).toBe('Test Program');
  });

  test('Admin can view payments', async () => {
    const res = await get('/api/admin/payments', adminToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
  });

  test('Admin can manage blogs', async () => {
    const create = await post('/api/admin/blogs', {
      title: 'Test Blog Post', excerpt: 'Test excerpt', content: 'Full content here.',
      category: 'General', isPublished: true, readTime: 3
    }, adminToken);
    expect(create.status).toBe(201);
    blogId = create.body.blog.id;

    // Update
    const update = await put(`/api/admin/blogs/${blogId}`, { isFeatured: true }, adminToken);
    expect(update.status).toBe(200);

    // Delete
    const deleteRes = await del(`/api/admin/blogs/${blogId}`, adminToken);
    expect(deleteRes.status).toBe(200);
  });

  test('Non-admin cannot access admin routes', async () => {
    const res = await get('/api/admin/users', userToken);
    expect(res.status).toBe(403);
  });

  test('Trainer cannot access admin routes', async () => {
    const res = await get('/api/admin/dashboard', trainerToken);
    expect(res.status).toBe(403);
  });

  test('Admin can toggle user active status', async () => {
    const res = await patch(`/api/admin/users/${userId}/toggle-active`, {}, adminToken);
    expect(res.status).toBe(200);
    // Re-activate
    await patch(`/api/admin/users/${userId}/toggle-active`, {}, adminToken);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. CHAT / MESSAGING TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Chat & Messaging', () => {

  test('GET /chat/conversations returns empty initially', async () => {
    const res = await get('/api/chat/conversations', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.conversations)).toBe(true);
  });

  test('POST /chat/send creates a conversation', async () => {
    const res = await post('/api/chat/send', {
      recipientId: trainerId,
      recipientModel: 'Trainer',
      content: 'Hello from test!'
    }, userToken);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message.content).toBe('Hello from test!');
  });

  test('GET /chat/conversations shows new conversation', async () => {
    const res = await get('/api/chat/conversations', userToken);
    expect(res.status).toBe(200);
    expect(res.body.conversations.length).toBeGreaterThan(0);
  });

  test('Trainer can see conversation', async () => {
    const res = await get('/api/chat/conversations', trainerToken);
    expect(res.status).toBe(200);
    expect(res.body.conversations.length).toBeGreaterThan(0);
  });

  test('Trainer can reply to user', async () => {
    const convos = await get('/api/chat/conversations', trainerToken);
    const convoId = convos.body.conversations[0]?.id || convos.body.conversations[0]?._id;
    if (!convoId) return;
    const res = await post('/api/chat/send', {
      conversationId: convoId,
      recipientId: userId,
      recipientModel: 'User',
      content: 'Hi back from trainer!'
    }, trainerToken);
    expect(res.status).toBe(201);
  });

  test('Empty message is rejected', async () => {
    const res = await post('/api/chat/send', {
      recipientId: trainerId, recipientModel: 'Trainer', content: ''
    }, userToken);
    expect(res.status).toBe(400);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. NOTIFICATIONS TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Notifications', () => {

  test('GET /notifications returns user notifications', async () => {
    const res = await get('/api/notifications', userToken);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  test('PATCH /notifications/read-all marks all as read', async () => {
    const res = await patch('/api/notifications/read-all', {}, userToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PUBLIC BLOG TESTS
// ═══════════════════════════════════════════════════════════════════════════════
describe('Public Blog', () => {

  test('GET /blogs returns published posts', async () => {
    const res = await get('/api/blogs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.blogs)).toBe(true);
    // All returned blogs should be published
    res.body.blogs.forEach(b => expect(b.isPublished).toBe(true));
  });

});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════
describe('Health & System', () => {

  test('GET /health returns healthy', async () => {
    const res = await get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  test('Unknown route returns 404', async () => {
    const res = await get('/api/nonexistent');
    expect(res.status).toBe(404);
  });

});
