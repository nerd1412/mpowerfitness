/**
 * Mock API — provides instant responses when the backend is unavailable.
 * Used automatically when REACT_APP_USE_MOCK=true or when backend calls fail
 * with a network error (ECONNREFUSED / ERR_NETWORK).
 *
 * Demo credentials:
 *   user:    user@mpowerfitness.com  / User@123456
 *   trainer: arjun@mpowerfitness.com / Trainer@123
 *   admin:   admin@mpowerfitness.com / Admin@123456
 */

const uuid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);

// ─── Stable demo data ───────────────────────────────────────────────────────
const DEMO_USERS = {
  'user@mpowerfitness.com': {
    password: 'User@123456',
    user: {
      id: 'usr_001', name: 'Rahul Verma', email: 'user@mpowerfitness.com',
      role: 'user', avatar: null, phone: '9876543210',
      onboardingCompleted: true, fitnessGoal: 'weight_loss',
      fitnessLevel: 'intermediate', lifestyle: 'moderately_active',
      age: 28, gender: 'male', height: 175, weight: 78, targetWeight: 70,
      streak: 7, longestStreak: 21, totalWorkouts: 34,
      totalCaloriesBurned: 12400, points: 340,
      badges: [
        { name: 'First Workout', icon: '🏋️', description: 'Completed your first workout' },
        { name: 'Week Warrior', icon: '🔥', description: '7-day streak achieved' },
        { name: 'Early Bird', icon: '🌅', description: 'Completed 5 morning workouts' },
      ],
      subscription: { plan: 'monthly', isActive: true, endDate: new Date(Date.now() + 30 * 86400000).toISOString() },
      assignedTrainer: { _id: 'trn_001', name: 'Arjun Mehta', avatar: null, rating: 4.9, specializations: ['weight_training', 'nutrition'] },
    },
  },
  'arjun@mpowerfitness.com': {
    password: 'Trainer@123',
    user: {
      id: 'trn_001', name: 'Arjun Mehta', email: 'arjun@mpowerfitness.com',
      role: 'trainer', avatar: null, phone: '9876543211',
      specializations: ['weight_training', 'nutrition'],
      experience: 8, bio: 'Certified strength and nutrition coach.',
      rating: 4.9, totalRatings: 124, totalSessions: 876, totalEarnings: 450000,
      sessionRate: 800, monthlyRate: 5000,
      isApproved: true, isActive: true,
    },
  },
  'priya@mpowerfitness.com': {
    password: 'Trainer@123',
    user: {
      id: 'trn_002', name: 'Priya Sharma', email: 'priya@mpowerfitness.com',
      role: 'trainer', avatar: null, specializations: ['yoga', 'meditation'],
      experience: 6, rating: 4.8, totalSessions: 654, totalEarnings: 320000,
      sessionRate: 600, monthlyRate: 3500, isApproved: true, isActive: true,
    },
  },
  'admin@mpowerfitness.com': {
    password: 'Admin@123456',
    user: {
      id: 'adm_001', name: 'Mpower Admin', email: 'admin@mpowerfitness.com',
      role: 'admin', avatar: null, permissions: ['all'],
    },
  },
};

const makeToken = (id, role) =>
  btoa(JSON.stringify({ id, role, exp: Date.now() + 15 * 60 * 1000 })) + '.mock.' + uuid().slice(0, 8);

// ─── Route handlers ─────────────────────────────────────────────────────────
const ROUTES = {
  'POST /auth/user/login': ({ email, password }) => {
    const entry = DEMO_USERS[email?.toLowerCase()];
    if (!entry || entry.password !== password || entry.user.role !== 'user')
      return [401, { success: false, message: 'Invalid email or password' }];
    const { user } = entry;
    return [200, {
      success: true, user,
      accessToken: makeToken(user.id, 'user'),
      refreshToken: makeToken(user.id, 'user') + '_refresh',
    }];
  },

  'POST /auth/user/register': ({ name, email, password }) => {
    if (!name || !email || !password)
      return [400, { success: false, message: 'All fields are required' }];
    if (password.length < 8)
      return [400, { success: false, message: 'Password must be at least 8 characters' }];
    const newUser = {
      id: 'usr_' + uuid().slice(0, 6), name, email: email.toLowerCase(),
      role: 'user', onboardingCompleted: false,
      streak: 0, points: 0, badges: [],
      subscription: { plan: 'free', isActive: false },
    };
    return [201, {
      success: true, user: newUser,
      accessToken: makeToken(newUser.id, 'user'),
      refreshToken: makeToken(newUser.id, 'user') + '_refresh',
    }];
  },

  'POST /auth/trainer/login': ({ email, password }) => {
    const entry = DEMO_USERS[email?.toLowerCase()];
    if (!entry || entry.password !== password || entry.user.role !== 'trainer')
      return [401, { success: false, message: 'Invalid email or password' }];
    const { user } = entry;
    if (!user.isApproved) return [403, { success: false, message: 'Account pending admin approval', code: 'PENDING_APPROVAL' }];
    return [200, {
      success: true, user,
      accessToken: makeToken(user.id, 'trainer'),
      refreshToken: makeToken(user.id, 'trainer') + '_refresh',
    }];
  },

  'POST /auth/trainer/register': (body) => {
    if (!body.name || !body.email || !body.password)
      return [400, { success: false, message: 'Name, email and password are required' }];
    return [201, { success: true, message: 'Application submitted. Awaiting admin approval.' }];
  },

  'POST /auth/admin/login': ({ email, password }) => {
    const entry = DEMO_USERS[email?.toLowerCase()];
    if (!entry || entry.password !== password || !['admin', 'superadmin'].includes(entry.user.role))
      return [401, { success: false, message: 'Invalid credentials' }];
    const { user } = entry;
    return [200, {
      success: true, user,
      accessToken: makeToken(user.id, 'admin'),
      refreshToken: makeToken(user.id, 'admin') + '_refresh',
    }];
  },

  'POST /auth/logout': () => [200, { success: true }],
  'POST /auth/refresh': () => [200, { success: false, message: 'Mock: re-login required' }],

  'POST /auth/user/onboarding': (body) => [200, { success: true, user: { ...body, onboardingCompleted: true } }],

  'GET /users/dashboard': () => [200, {
    success: true,
    data: {
      user: DEMO_USERS['user@mpowerfitness.com'].user,
      recentSessions: [
        { _id: 's1', workoutName: 'Full Body Power Blast', category: 'strength', caloriesBurned: 380, duration: 45, createdAt: new Date(Date.now() - 86400000) },
        { _id: 's2', workoutName: 'Morning Yoga Flow', category: 'yoga', caloriesBurned: 120, duration: 30, createdAt: new Date(Date.now() - 172800000) },
      ],
      upcomingBookings: [
        { _id: 'b1', trainer: { name: 'Arjun Mehta', avatar: null }, sessionDate: new Date(Date.now() + 86400000), startTime: '07:00', endTime: '08:00', status: 'confirmed', amount: 800 },
      ],
      weeklyCalories: 1560,
    },
  }],

  'GET /workouts': () => [200, { success: true, workouts: MOCK_WORKOUTS, total: MOCK_WORKOUTS.length }],
  'GET /workouts/*': (_, path) => {
    const id = path.split('/').pop();
    const w = MOCK_WORKOUTS.find(x => x._id === id) || MOCK_WORKOUTS[0];
    return [200, { success: true, workout: w }];
  },

  'GET /trainers': () => [200, { success: true, trainers: MOCK_TRAINERS }],
  'GET /trainers/*': (_, path) => {
    const id = path.split('/').pop();
    if (id === 'dashboard') return [200, {
      success: true,
      data: {
        trainer: DEMO_USERS['arjun@mpowerfitness.com'].user,
        upcomingBookings: MOCK_BOOKINGS.slice(0, 2),
        recentBookings: [],
        pendingBookings: [MOCK_BOOKINGS[2]],
        weeklyEarnings: 6400,
      },
    }];
    return [200, { success: true, trainer: MOCK_TRAINERS[0] }];
  },

  'GET /bookings/my': () => [200, { success: true, bookings: MOCK_BOOKINGS }],
  'GET /bookings/trainer-schedule': () => [200, { success: true, bookings: MOCK_BOOKINGS }],
  'POST /bookings': (body) => [201, { success: true, booking: { _id: 'bk_' + uuid().slice(0, 6), ...body, status: 'pending', amount: 800 } }],
  'PATCH /bookings/*': (body) => [200, { success: true, booking: { ...body } }],
  'POST /bookings/*/rate': () => [200, { success: true }],

  'GET /progress/my': () => [200, { success: true, progress: MOCK_PROGRESS }],
  'POST /progress': (body) => [201, { success: true, progress: { _id: uuid(), ...body } }],

  'GET /nutrition': () => [200, { success: true, plans: MOCK_NUTRITION }],
  'GET /programs': () => [200, { success: true, programs: MOCK_PROGRAMS }],
  'GET /notifications': () => [200, { success: true, notifications: [], unreadCount: 0 }],
  'PATCH /notifications/read-all': () => [200, { success: true }],

  'POST /workouts/session/log': (body) => [201, { success: true, session: { _id: uuid(), ...body }, newStreak: 8 }],
  'GET /workouts/history/my': () => [200, { success: true, sessions: [] }],

  'POST /payments/upi/initiate': ({ amount }) => {
    const ref = 'MPF' + Date.now();
    return [200, {
      success: true,
      payment: { id: uuid(), ref, amount, upiId: 'payments@mpowerfitness', merchantName: 'Mpower Fitness' },
      upiLink: `upi://pay?pa=payments@mpowerfitness&am=${amount}&cu=INR&tr=${ref}`,
      qrUrl: `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chl=upi://pay?pa=payments@mpowerfitness%26am=${amount}%26cu=INR&choe=UTF-8`,
      appLinks: {},
      expiresIn: 600,
    }];
  },
  'POST /payments/upi/verify': () => [200, { success: true, message: 'Payment verified!' }],
  'GET /payments/my': () => [200, { success: true, payments: [] }],
  'GET /payments/upi/status/*': () => [200, { success: true, status: 'pending' }],

  'GET /admin/dashboard': () => [200, {
    success: true,
    data: {
      stats: {
        totalUsers: 1248, newUsersThisMonth: 87, activeUsers: 1102,
        totalTrainers: 24, approvedTrainers: 21, pendingApprovals: 3,
        totalBookings: 3840, bookingsThisMonth: 312, completedBookings: 3510,
        totalRevenue: 3120000, revenueThisMonth: 312000, revenueGrowth: 18,
        activeSubscriptions: 486,
      },
      charts: { revenueByMonth: [], userGrowth: [] },
      topTrainers: MOCK_TRAINERS,
    },
  }],
  'GET /admin/trainers': () => [200, { success: true, trainers: MOCK_TRAINERS_ADMIN, total: MOCK_TRAINERS_ADMIN.length, pages: 1 }],
  'POST /admin/trainers/approve/*': () => [200, { success: true, message: 'Trainer approved' }],
  'POST /admin/trainers/reject/*': () => [200, { success: true, message: 'Trainer rejected' }],
  'PUT /admin/trainers/*': (body) => [200, { success: true, trainer: body }],
  'GET /admin/users': () => [200, { success: true, users: MOCK_ADMIN_USERS, total: 4, pages: 1 }],
  'POST /admin/users/*/assign-trainer/*': () => [200, { success: true, message: 'Trainer assigned' }],
  'GET /admin/bookings': () => [200, { success: true, bookings: MOCK_BOOKINGS, total: 3, pages: 1 }],
  'GET /admin/payments': () => [200, { success: true, payments: MOCK_PAYMENTS, total: 3, pages: 1 }],
  'POST /admin/notifications/broadcast': () => [200, { success: true, message: 'Notification sent to all recipients' }],
  'GET /admin/analytics/revenue': () => [200, { success: true, data: { revenueByType: [], revenueByMonth: [], subscriptionBreakdown: [] } }],

  'PUT /users/profile': (body) => [200, { success: true, user: body }],
  'PUT /trainers/availability': (body) => [200, { success: true, availability: body.availability }],
  'PUT /trainers/profile': (body) => [200, { success: true, trainer: body }],

  'GET /chat/conversations': () => [200, { success: true, conversations: [] }],
  'POST /chat/send': (body) => [201, { success: true, message: { _id: uuid(), ...body, createdAt: new Date() }, conversationId: uuid() }],
};

// ─── Shared mock data ────────────────────────────────────────────────────────
const MOCK_WORKOUTS = [
  { _id: 'wk1', title: 'Full Body Power Blast', category: 'strength', difficulty: 'intermediate', duration: 45, caloriesBurn: 380, isFeatured: true, tags: ['full-body','strength'], exercises: [
    { name: 'Barbell Squat', sets: 4, reps: '8-10', restTime: 90, instructions: 'Keep chest up, drive through heels', muscleGroups: ['quads','glutes'] },
    { name: 'Bench Press', sets: 4, reps: '8-10', restTime: 90, instructions: 'Lower bar to chest, press explosively', muscleGroups: ['chest','triceps'] },
    { name: 'Deadlift', sets: 3, reps: '6-8', restTime: 120, instructions: 'Hinge at hips, keep back neutral', muscleGroups: ['back','glutes'] },
    { name: 'Pull-ups', sets: 3, reps: '8-12', restTime: 90, instructions: 'Full range of motion', muscleGroups: ['back','biceps'] },
    { name: 'Overhead Press', sets: 3, reps: '10-12', restTime: 90, instructions: 'Press directly overhead', muscleGroups: ['shoulders'] },
  ]},
  { _id: 'wk2', title: 'Morning Yoga Flow', category: 'yoga', difficulty: 'beginner', duration: 30, caloriesBurn: 120, isFeatured: true, tags: ['yoga','morning'], exercises: [
    { name: 'Sun Salutation A', sets: 3, duration: 180, instructions: '5 breaths each pose', muscleGroups: ['full body'] },
    { name: 'Warrior I', duration: 60, instructions: 'Ground back foot, reach arms overhead', muscleGroups: ['legs','hips'] },
    { name: 'Warrior II', duration: 60, instructions: 'Extend arms parallel to floor', muscleGroups: ['legs','hips'] },
    { name: 'Triangle Pose', duration: 60, instructions: 'Extend side body', muscleGroups: ['hips','hamstrings'] },
  ]},
  { _id: 'wk3', title: 'HIIT Cardio Inferno', category: 'hiit', difficulty: 'advanced', duration: 20, caloriesBurn: 320, isFeatured: true, tags: ['hiit','cardio'], exercises: [
    { name: 'Burpees', sets: 4, duration: 40, restTime: 20, instructions: '40 on, 20 rest', muscleGroups: ['full body'] },
    { name: 'Jump Squats', sets: 4, duration: 40, restTime: 20, instructions: 'Land softly', muscleGroups: ['quads','glutes'] },
    { name: 'Mountain Climbers', sets: 4, duration: 40, restTime: 20, instructions: 'Keep hips level', muscleGroups: ['core'] },
    { name: 'High Knees', sets: 4, duration: 40, restTime: 20, instructions: 'Drive knees to chest', muscleGroups: ['core'] },
  ]},
  { _id: 'wk4', title: 'Core Crusher', category: 'strength', difficulty: 'intermediate', duration: 25, caloriesBurn: 180, tags: ['core','abs'], exercises: [
    { name: 'Plank', sets: 3, duration: 60, restTime: 30, instructions: "Don't sag hips", muscleGroups: ['core'] },
    { name: 'Russian Twists', sets: 3, reps: '20', restTime: 45, instructions: 'Rotate fully', muscleGroups: ['obliques'] },
    { name: 'Leg Raises', sets: 3, reps: '15', restTime: 45, instructions: "Don't arch back", muscleGroups: ['lower abs'] },
  ]},
  { _id: 'wk5', title: 'Beginner Cardio Boost', category: 'cardio', difficulty: 'beginner', duration: 30, caloriesBurn: 200, tags: ['cardio','beginner'], exercises: [
    { name: 'Jumping Jacks', sets: 3, duration: 60, restTime: 30, instructions: 'Keep arms straight', muscleGroups: ['full body'] },
    { name: 'Brisk Walk', duration: 600, instructions: 'Maintain 5 kmph pace', muscleGroups: ['legs'] },
  ]},
  { _id: 'wk6', title: 'Upper Body Strength', category: 'strength', difficulty: 'intermediate', duration: 40, caloriesBurn: 290, tags: ['upper-body'], exercises: [
    { name: 'Push-ups', sets: 4, reps: '15', restTime: 60, instructions: 'Full range', muscleGroups: ['chest','triceps'] },
    { name: 'Dumbbell Row', sets: 4, reps: '12', restTime: 60, instructions: 'Keep back flat', muscleGroups: ['back','biceps'] },
  ]},
];

const MOCK_TRAINERS = [
  { _id: 'trn_001', name: 'Arjun Mehta', email: 'arjun@mpowerfitness.com', specializations: ['weight_training','nutrition'], experience: 8, rating: 4.9, totalRatings: 124, sessionRate: 800, monthlyRate: 5000, bio: 'Certified strength and nutrition coach with 8 years of experience helping clients transform.', clients: Array(24), totalSessions: 876, isApproved: true, isActive: true },
  { _id: 'trn_002', name: 'Priya Sharma', email: 'priya@mpowerfitness.com', specializations: ['yoga','meditation','flexibility'], experience: 6, rating: 4.8, totalRatings: 89, sessionRate: 600, monthlyRate: 3500, bio: 'RYT-500 certified yoga instructor specializing in stress reduction and mind-body balance.', clients: Array(18), totalSessions: 654, isApproved: true, isActive: true },
  { _id: 'trn_003', name: 'Rahul Kapoor', email: 'rahul@mpowerfitness.com', specializations: ['hiit','cardio','sports_specific'], experience: 5, rating: 4.7, totalRatings: 67, sessionRate: 700, monthlyRate: 4000, bio: 'High performance sports trainer with expertise in HIIT and athletic conditioning.', clients: Array(12), totalSessions: 423, isApproved: true, isActive: true },
];

const MOCK_TRAINERS_ADMIN = [
  ...MOCK_TRAINERS,
  { _id: 'trn_004', name: 'Ravi Kumar', email: 'ravi@example.com', specializations: ['hiit','cardio'], experience: 3, rating: 0, totalRatings: 0, sessionRate: 500, monthlyRate: 2500, bio: 'Aspiring fitness trainer with ACSM certification.', clients: [], totalSessions: 0, isApproved: false, isActive: false },
];

const MOCK_BOOKINGS = [
  { _id: 'bk1', trainer: { name: 'Arjun Mehta', avatar: null }, user: { name: 'Rahul Verma', email: 'user@mpowerfitness.com' }, sessionDate: new Date(Date.now() + 86400000), startTime: '07:00', endTime: '08:00', status: 'confirmed', amount: 800, sessionType: 'online', paymentStatus: 'paid' },
  { _id: 'bk2', trainer: { name: 'Priya Sharma', avatar: null }, user: { name: 'Rahul Verma', email: 'user@mpowerfitness.com' }, sessionDate: new Date(Date.now() + 172800000), startTime: '18:00', endTime: '19:00', status: 'pending', amount: 600, sessionType: 'online', paymentStatus: 'pending' },
  { _id: 'bk3', trainer: { name: 'Arjun Mehta', avatar: null }, user: { name: 'Sneha Patel', email: 'sneha@example.com' }, sessionDate: new Date(Date.now() - 86400000), startTime: '07:00', endTime: '08:00', status: 'completed', amount: 800, sessionType: 'in_person', paymentStatus: 'paid' },
];

const MOCK_PROGRESS = [
  { _id: 'p1', date: new Date(Date.now() - 7*86400000), weight: 79, bodyFat: 20.2, measurements: { waist: 83, chest: 98 }, caloriesBurned: 410 },
  { _id: 'p2', date: new Date(Date.now() - 14*86400000), weight: 79.8, bodyFat: 20.8, measurements: { waist: 84, chest: 98 }, caloriesBurned: 380 },
  { _id: 'p3', date: new Date(Date.now() - 21*86400000), weight: 80.5, bodyFat: 21, measurements: { waist: 84, chest: 97 }, caloriesBurned: 350 },
  { _id: 'p4', date: new Date(Date.now() - 28*86400000), weight: 81.2, bodyFat: 21.5, measurements: { waist: 85, chest: 97 }, caloriesBurned: 290 },
  { _id: 'p5', date: new Date(Date.now() - 56*86400000), weight: 82, bodyFat: 22, measurements: { waist: 86, chest: 96 }, caloriesBurned: 320 },
];

const MOCK_NUTRITION = [
  { _id: 'n1', title: 'Fat Loss Diet Plan', goal: 'weight_loss', caloriesPerDay: 1800, proteinGrams: 150, carbsGrams: 160, fatGrams: 55, meals: [
    { name: 'Breakfast', time: '7:00 AM', items: [{ name: 'Oats with berries', calories: 320, protein: 12, carbs: 52, fat: 6 }, { name: 'Boiled eggs (2)', calories: 140, protein: 12, carbs: 0, fat: 10 }] },
    { name: 'Lunch', time: '1:00 PM', items: [{ name: 'Grilled chicken breast', calories: 250, protein: 46, carbs: 0, fat: 5 }, { name: 'Brown rice', calories: 215, protein: 5, carbs: 45, fat: 2 }, { name: 'Steamed veggies', calories: 80, protein: 3, carbs: 15, fat: 1 }] },
    { name: 'Snack', time: '4:00 PM', items: [{ name: 'Greek yogurt', calories: 100, protein: 17, carbs: 6, fat: 0 }, { name: 'Mixed nuts', calories: 160, protein: 5, carbs: 6, fat: 14 }] },
    { name: 'Dinner', time: '8:00 PM', items: [{ name: 'Paneer tikka', calories: 280, protein: 18, carbs: 8, fat: 18 }, { name: 'Dal', calories: 130, protein: 9, carbs: 20, fat: 1 }] },
  ]},
  { _id: 'n2', title: 'Muscle Building Plan', goal: 'muscle_gain', caloriesPerDay: 2800, proteinGrams: 210, carbsGrams: 300, fatGrams: 75, meals: [
    { name: 'Pre-workout', time: '6:30 AM', items: [{ name: 'Banana', calories: 89, protein: 1, carbs: 23, fat: 0 }, { name: 'Whey protein shake', calories: 120, protein: 24, carbs: 5, fat: 1 }] },
    { name: 'Breakfast', time: '8:00 AM', items: [{ name: 'Whole eggs (3) + whites (2)', calories: 280, protein: 30, carbs: 2, fat: 15 }, { name: 'Multigrain toast', calories: 140, protein: 5, carbs: 28, fat: 2 }] },
    { name: 'Lunch', time: '1:00 PM', items: [{ name: 'Chicken breast 200g', calories: 330, protein: 62, carbs: 0, fat: 7 }, { name: 'Sweet potato', calories: 180, protein: 4, carbs: 41, fat: 0 }] },
  ]},
];

const MOCK_PROGRAMS = [
  { _id: 'pr1', title: 'Transform 90', description: 'A comprehensive 90-day transformation program combining strength, cardio, and nutrition.', duration: 13, level: 'intermediate', goal: 'Body Transformation', isFeatured: true, pricing: { monthly: 1999, quarterly: 4999, premium: 8999 }, features: ['Personalized workout plan','Nutrition guidance','Weekly check-ins','1-on-1 trainer support','Progress tracking','Community access'], enrolledCount: 1247 },
  { _id: 'pr2', title: 'Beginner Kickstart', description: 'Build a solid fitness foundation in 30 days with guided workouts and expert support.', duration: 4, level: 'beginner', goal: 'Build Foundation', pricing: { monthly: 999, quarterly: 2499, premium: 4999 }, features: ['Step-by-step guides','Video demos','Nutrition basics','Community support'], enrolledCount: 3421 },
  { _id: 'pr3', title: 'Elite Performance', description: 'Advanced program for athletes looking to reach peak performance levels.', duration: 16, level: 'advanced', goal: 'Peak Performance', isFeatured: true, pricing: { monthly: 2999, quarterly: 7499, premium: 12999 }, features: ['Advanced periodization','Sports-specific training','Elite nutrition','Daily trainer access','Performance analytics'], enrolledCount: 456 },
];

const MOCK_ADMIN_USERS = [
  { _id: 'usr_001', name: 'Rahul Verma', email: 'user@mpowerfitness.com', fitnessGoal: 'weight_loss', fitnessLevel: 'intermediate', subscription: { plan: 'monthly', isActive: true }, streak: 12, totalWorkouts: 45, assignedTrainer: { name: 'Arjun Mehta' }, createdAt: new Date(Date.now()-86400000*60) },
  { _id: 'usr_002', name: 'Sneha Patel', email: 'sneha@example.com', fitnessGoal: 'muscle_gain', fitnessLevel: 'beginner', subscription: { plan: 'free', isActive: false }, streak: 3, totalWorkouts: 8, assignedTrainer: null, createdAt: new Date(Date.now()-86400000*30) },
  { _id: 'usr_003', name: 'Amit Singh', email: 'amit@example.com', fitnessGoal: 'endurance', fitnessLevel: 'advanced', subscription: { plan: 'premium', isActive: true }, streak: 28, totalWorkouts: 134, assignedTrainer: { name: 'Priya Sharma' }, createdAt: new Date(Date.now()-86400000*120) },
  { _id: 'usr_004', name: 'Pooja Nair', email: 'pooja@example.com', fitnessGoal: 'flexibility', fitnessLevel: 'beginner', subscription: { plan: 'quarterly', isActive: true }, streak: 5, totalWorkouts: 22, assignedTrainer: { name: 'Rahul Kapoor' }, createdAt: new Date(Date.now()-86400000*15) },
];

const MOCK_PAYMENTS = [
  { _id: 'pay1', user: { name: 'Rahul Verma' }, amount: 1999, type: 'subscription', status: 'success', subscriptionPlan: 'monthly', createdAt: new Date() },
  { _id: 'pay2', user: { name: 'Amit Singh' }, amount: 800, type: 'session_booking', status: 'success', createdAt: new Date(Date.now()-86400000) },
  { _id: 'pay3', user: { name: 'Pooja Nair' }, amount: 4999, type: 'subscription', status: 'success', subscriptionPlan: 'quarterly', createdAt: new Date(Date.now()-172800000) },
];

// ─── Mock handler ────────────────────────────────────────────────────────────
export function matchMockRoute(method, path, body) {
  const key = `${method} ${path}`;

  // Exact match
  if (ROUTES[key]) return ROUTES[key](body, path);

  // Wildcard match (e.g. GET /workouts/*)
  for (const pattern of Object.keys(ROUTES)) {
    if (!pattern.includes('*')) continue;
    const [pm, pp] = pattern.split(' ');
    if (pm !== method) continue;
    const regex = new RegExp('^' + pp.replace(/\*/g, '[^/]+') + '$');
    if (regex.test(path)) return ROUTES[pattern](body, path);
  }

  // Default 404
  return [404, { success: false, message: `Mock: no handler for ${method} ${path}` }];
}

export { MOCK_WORKOUTS, MOCK_TRAINERS, MOCK_BOOKINGS, MOCK_PROGRESS, MOCK_NUTRITION, MOCK_PROGRAMS };
