const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Trainer, Admin, Workout, NutritionPlan, Program, Notification, Blog } = require('../models/index');
const h = pw => bcrypt.hash(pw, 10);

const seed = async () => {
  console.log('🌱 Seeding Mpower Fitness database...');

  // ── ADMIN ──────────────────────────────────────────────────────
  const admin = await Admin.create({
    name: 'Mpower Admin', email: 'admin@mpowerfitness.com',
    password: await h('Admin@123456'), role: 'superadmin', isActive: true,
    upiId: 'payments@mpowerfitness', upiName: 'Mpower Fitness', permissions: ['all'],
  });

  // ── TRAINERS ───────────────────────────────────────────────────
  // Realistic Indian fitness trainer pricing 2024:
  // PT session: ₹500–2000 | Online coaching: ₹3000–15000/month
  const trainer1 = await Trainer.create({
    name: 'Arjun Mehta', email: 'arjun@mpowerfitness.com',
    password: await h('Trainer@123'),
    phone: '9876543211', isApproved: true, isActive: true,
    specializations: ['weight_training', 'nutrition', 'body_recomposition'],
    certifications: [{ name: 'NASM-CPT', issuedBy: 'NASM', year: 2018 }, { name: 'Precision Nutrition L1', issuedBy: 'PN', year: 2019 }],
    experience: 8,
    bio: 'Certified strength & nutrition coach with 8+ years. Specialises in body recomposition and personalized programming. Former national-level powerlifter. 200+ client transformations.',
    // Realistic: ₹800–1200/session in Mumbai; ₹6000–8000/month coaching
    sessionRate: 1200,
    monthlyRate: 8000,
    city: 'Mumbai', state: 'Maharashtra', locationText: 'Andheri West, Mumbai',
    isOnline: true,
    rating: 4.9, totalRatings: 124, totalSessions: 876, totalEarnings: 1050000,
    upiId: 'arjun.mehta@upi',
    availability: [
      { day: 'monday',    slots: [{ startTime: '06:00', endTime: '07:00' }, { startTime: '07:00', endTime: '08:00' }, { startTime: '18:00', endTime: '19:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'tuesday',   slots: [{ startTime: '06:00', endTime: '07:00' }, { startTime: '07:00', endTime: '08:00' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'wednesday', slots: [{ startTime: '06:00', endTime: '07:00' }, { startTime: '18:00', endTime: '19:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'thursday',  slots: [{ startTime: '06:00', endTime: '07:00' }, { startTime: '07:00', endTime: '08:00' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'friday',    slots: [{ startTime: '06:00', endTime: '07:00' }, { startTime: '17:00', endTime: '18:00' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'saturday',  slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '08:00', endTime: '09:00' }, { startTime: '09:00', endTime: '10:00' }] },
      { day: 'sunday',    slots: [] },
    ],
  });

  const trainer2 = await Trainer.create({
    name: 'Priya Sharma', email: 'priya@mpowerfitness.com',
    password: await h('Trainer@123'),
    phone: '9876543212', isApproved: true, isActive: true,
    specializations: ['yoga', 'flexibility', 'meditation', 'prenatal_fitness'],
    certifications: [{ name: 'RYT-500', issuedBy: 'Yoga Alliance', year: 2017 }, { name: 'Pre/Post Natal Yoga', issuedBy: 'YA', year: 2020 }],
    experience: 7,
    bio: 'Yoga & mindfulness expert helping clients find balance between physical fitness and mental wellbeing. Specialises in therapeutic yoga, stress reduction, and flexibility. Online & in-person.',
    sessionRate: 900,
    monthlyRate: 6000,
    city: 'Bangalore', state: 'Karnataka', locationText: 'Indiranagar, Bangalore',
    isOnline: true,
    rating: 4.8, totalRatings: 89, totalSessions: 540, totalEarnings: 486000,
    upiId: 'priya.sharma@upi',
    availability: [
      { day: 'monday',    slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '08:00', endTime: '09:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'tuesday',   slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'wednesday', slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '08:00', endTime: '09:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'thursday',  slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'friday',    slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '08:00', endTime: '09:00' }, { startTime: '19:00', endTime: '20:00' }] },
      { day: 'saturday',  slots: [{ startTime: '08:00', endTime: '09:00' }, { startTime: '09:00', endTime: '10:00' }] },
      { day: 'sunday',    slots: [{ startTime: '09:00', endTime: '10:00' }] },
    ],
  });

  const trainer3 = await Trainer.create({
    name: 'Karthik Nair', email: 'karthik@mpowerfitness.com',
    password: await h('Trainer@123'),
    phone: '9876543215', isApproved: true, isActive: true,
    specializations: ['hiit', 'cardio', 'sports_conditioning', 'weight_loss'],
    certifications: [{ name: 'ACE-CPT', issuedBy: 'ACE', year: 2020 }, { name: 'Kettlebell Specialist', issuedBy: 'IKFF', year: 2021 }],
    experience: 5,
    bio: 'HIIT & sports conditioning expert. Former semi-pro footballer turned fitness coach. Passionate about functional fitness, fat loss, and athletic performance. Online coaching available pan-India.',
    sessionRate: 1000,
    monthlyRate: 7000,
    city: 'Hyderabad', state: 'Telangana', locationText: 'Kondapur, Hyderabad',
    isOnline: true,
    rating: 4.7, totalRatings: 62, totalSessions: 380, totalEarnings: 380000,
    upiId: 'karthik.nair@upi',
    availability: [
      { day: 'monday',    slots: [{ startTime: '05:30', endTime: '06:30' }, { startTime: '17:00', endTime: '18:00' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'tuesday',   slots: [{ startTime: '05:30', endTime: '06:30' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'wednesday', slots: [{ startTime: '05:30', endTime: '06:30' }, { startTime: '17:00', endTime: '18:00' }] },
      { day: 'thursday',  slots: [{ startTime: '05:30', endTime: '06:30' }, { startTime: '18:00', endTime: '19:00' }] },
      { day: 'friday',    slots: [{ startTime: '05:30', endTime: '06:30' }, { startTime: '17:00', endTime: '18:00' }] },
      { day: 'saturday',  slots: [{ startTime: '07:00', endTime: '08:00' }, { startTime: '08:00', endTime: '09:00' }] },
      { day: 'sunday',    slots: [] },
    ],
  });

  // Pending trainer
  await Trainer.create({
    name: 'Sneha Kulkarni', email: 'sneha.trainer@mpowerfitness.com',
    password: await h('Trainer@123'),
    phone: '9876543216', isApproved: false, isActive: true,
    specializations: ['zumba', 'aerobics', 'group_fitness'],
    experience: 3,
    bio: 'Zumba & aerobics instructor with 3 years of group fitness experience. Passionate about making fitness fun and accessible.',
    sessionRate: 600, monthlyRate: 4000,
    city: 'Pune', state: 'Maharashtra', locationText: 'Koregaon Park, Pune',
    isOnline: false, availability: [],
  });

  console.log('✅ Trainers created');

  // ── USERS ──────────────────────────────────────────────────────
  const user1 = await User.create({
    name: 'Rahul Verma', email: 'user@mpowerfitness.com',
    password: await h('User@123456'),
    phone: '9876543210', isActive: true, onboardingCompleted: true,
    fitnessGoal: 'weight_loss', fitnessLevel: 'intermediate', lifestyle: 'moderately_active',
    preferredWorkoutTime: 'morning', workoutDaysPerWeek: 5,
    age: 28, gender: 'male', height: 175, weight: 82, targetWeight: 72,
    city: 'Mumbai', state: 'Maharashtra',
    subscriptionPlan: 'monthly', subscriptionActive: true,
    subscriptionStartDate: new Date(), subscriptionEndDate: new Date(Date.now() + 30 * 86400000),
    assignedTrainerId: trainer1.id,
    streak: 7, longestStreak: 21, totalWorkouts: 34, totalCaloriesBurned: 12400, points: 340,
    badges: [
      { name: 'First Workout', icon: '🏋️', description: 'Completed your first workout', earnedAt: new Date() },
      { name: 'Week Warrior',  icon: '🔥', description: '7-day streak achieved',        earnedAt: new Date() },
      { name: 'Early Bird',    icon: '🌅', description: 'Completed 5 morning workouts', earnedAt: new Date() },
    ],
  });

  // Link user to trainer1
  trainer1.clients = [user1.id];
  await trainer1.save();

  await User.create({
    name: 'Sneha Patel', email: 'sneha@mpowerfitness.com',
    password: await h('User@123456'),
    phone: '9876543214', isActive: true, onboardingCompleted: true,
    fitnessGoal: 'muscle_gain', fitnessLevel: 'beginner', lifestyle: 'lightly_active',
    age: 24, gender: 'female', height: 162, weight: 55, targetWeight: 60,
    city: 'Bangalore', state: 'Karnataka',
    subscriptionPlan: 'free', subscriptionActive: false,
    streak: 3, totalWorkouts: 8, totalCaloriesBurned: 2800, points: 80,
    badges: [{ name: 'First Workout', icon: '🏋️', description: 'Completed your first workout', earnedAt: new Date() }],
  });

  console.log('✅ Users created');

  // ── WORKOUTS ───────────────────────────────────────────────────
  await Workout.bulkCreate([
    {
      title: 'Full Body HIIT Blast', category: 'hiit', difficulty: 'intermediate',
      duration: 30, caloriesBurn: 350, isFeatured: true, isPublic: true,
      createdBy: admin.id, creatorModel: 'Admin',
      description: 'High-intensity interval training targeting all major muscle groups. Perfect for burning calories and improving cardiovascular fitness.',
      tags: ['hiit','full-body','cardio'], targetGoals: ['weight_loss','endurance'], equipment: ['none'],
      exercises: [
        { name: 'Jumping Jacks', sets: 3, reps: '30 seconds', restTime: 10, instructions: 'Keep arms fully extended, land softly', muscleGroups: ['full_body'] },
        { name: 'Burpees', sets: 3, reps: '40 seconds', restTime: 20, instructions: 'Full extension at top, chest to floor at bottom', muscleGroups: ['full_body'] },
        { name: 'High Knees', sets: 3, reps: '30 seconds', restTime: 10, instructions: 'Drive knees above hip level, pump arms', muscleGroups: ['legs','core'] },
        { name: 'Mountain Climbers', sets: 3, reps: '40 seconds', restTime: 15, instructions: 'Keep hips level, alternate legs rapidly', muscleGroups: ['core','arms'] },
        { name: 'Jump Squats', sets: 3, reps: '30 seconds', restTime: 15, instructions: 'Land with soft knees, explode upward', muscleGroups: ['legs','glutes'] },
      ],
    },
    {
      title: 'Upper Body Strength', category: 'strength', difficulty: 'intermediate',
      duration: 45, caloriesBurn: 280, isFeatured: true, isPublic: true,
      createdBy: admin.id, creatorModel: 'Admin',
      description: 'Comprehensive upper body workout for chest, back, shoulders and arms.',
      tags: ['strength','upper-body','muscle'], targetGoals: ['muscle_gain'], equipment: ['dumbbells','barbell'],
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '8–10', restTime: 90, instructions: 'Keep feet flat, lower bar to lower chest', muscleGroups: ['chest','triceps','shoulders'] },
        { name: 'Pull-ups', sets: 3, reps: '8–12', restTime: 90, instructions: 'Full extension at bottom, chin above bar', muscleGroups: ['back','biceps'] },
        { name: 'Overhead Press', sets: 3, reps: '10–12', restTime: 75, instructions: 'Press directly overhead, brace core', muscleGroups: ['shoulders','triceps'] },
        { name: 'Bent-over Rows', sets: 4, reps: '10–12', restTime: 75, instructions: 'Hinge at hips, pull to lower chest', muscleGroups: ['back','biceps'] },
        { name: 'Tricep Dips', sets: 3, reps: '12–15', restTime: 60, instructions: 'Keep elbows tracking back', muscleGroups: ['triceps','chest'] },
      ],
    },
    {
      title: 'Morning Yoga Flow', category: 'yoga', difficulty: 'beginner',
      duration: 30, caloriesBurn: 120, isPublic: true,
      createdBy: trainer2.id, creatorModel: 'Trainer',
      description: 'Gentle yet energising yoga sequence to start your day. Improves flexibility, mobility and mental clarity.',
      tags: ['yoga','flexibility','morning'], targetGoals: ['flexibility','general_fitness'], equipment: ['yoga mat'],
      exercises: [
        { name: 'Sun Salutation A', sets: 5, reps: '1 round', duration: 60, instructions: 'Flow through each pose with breath', muscleGroups: ['full_body'] },
        { name: 'Warrior I & II', sets: 1, reps: '5 breaths each side', instructions: 'Ground through back foot, open hips', muscleGroups: ['legs','core'] },
        { name: 'Triangle Pose', sets: 1, reps: '5 breaths each side', instructions: 'Extend torso over front leg', muscleGroups: ['side_body','legs'] },
        { name: 'Bridge Pose', sets: 3, reps: '8-breath holds', instructions: 'Press feet and arms into mat, lift hips', muscleGroups: ['glutes','back'] },
        { name: 'Seated Forward Fold', sets: 1, reps: '10 breaths', instructions: 'Lengthen spine, fold from hips not waist', muscleGroups: ['hamstrings','back'] },
      ],
    },
    {
      title: 'Lower Body Power', category: 'strength', difficulty: 'advanced',
      duration: 50, caloriesBurn: 340, isPublic: true,
      createdBy: admin.id, creatorModel: 'Admin',
      description: 'Leg day focused on building strength and power in quads, hamstrings and glutes.',
      tags: ['legs','strength','power'], targetGoals: ['muscle_gain','sports_performance'], equipment: ['barbell','dumbbells'],
      exercises: [
        { name: 'Back Squats', sets: 5, reps: '5', restTime: 120, instructions: 'Depth below parallel, knees tracking toes', muscleGroups: ['quads','glutes','core'] },
        { name: 'Romanian Deadlift', sets: 4, reps: '8–10', restTime: 90, instructions: 'Hinge at hips, feel hamstring stretch', muscleGroups: ['hamstrings','glutes'] },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each leg', restTime: 75, instructions: 'Rear foot elevated, drop straight down', muscleGroups: ['quads','glutes'] },
        { name: 'Leg Press', sets: 3, reps: '12–15', restTime: 60, instructions: 'Full range of motion, do not lock knees', muscleGroups: ['quads','hamstrings'] },
        { name: 'Standing Calf Raises', sets: 4, reps: '20', restTime: 45, instructions: 'Full extension at top, slow eccentric', muscleGroups: ['calves'] },
      ],
    },
    {
      title: 'Core & Abs Shred', category: 'strength', difficulty: 'intermediate',
      duration: 25, caloriesBurn: 180, isPublic: true,
      createdBy: admin.id, creatorModel: 'Admin',
      description: 'Targeted core workout to build a strong, stable midsection.',
      tags: ['core','abs'], targetGoals: ['weight_loss','general_fitness'], equipment: ['none'],
      exercises: [
        { name: 'Plank', sets: 3, reps: '60 seconds', restTime: 30, instructions: 'Keep hips level, breathe steadily', muscleGroups: ['core','shoulders'] },
        { name: 'Bicycle Crunches', sets: 3, reps: '20 each side', restTime: 30, instructions: 'Rotate fully, extend opposite leg', muscleGroups: ['obliques','abs'] },
        { name: 'Hanging Leg Raises', sets: 3, reps: '12', restTime: 45, instructions: 'Controlled movement, no swinging', muscleGroups: ['lower_abs','hip_flexors'] },
        { name: 'Russian Twists', sets: 3, reps: '20', restTime: 30, instructions: 'Lift feet for more challenge', muscleGroups: ['obliques'] },
        { name: 'Dead Bug', sets: 3, reps: '10 each side', restTime: 30, instructions: 'Press lower back into floor throughout', muscleGroups: ['core','stability'] },
      ],
    },
    {
      title: '5K Run Training', category: 'cardio', difficulty: 'beginner',
      duration: 35, caloriesBurn: 300, isPublic: true,
      createdBy: admin.id, creatorModel: 'Admin',
      description: 'Structured run-walk program for beginners building up to 5K.',
      tags: ['running','cardio','endurance'], targetGoals: ['endurance','weight_loss'], equipment: ['none'],
      exercises: [
        { name: 'Warm-up Walk', sets: 1, duration: 300, instructions: '5-min brisk walk to warm up joints' },
        { name: 'Run-Walk Intervals', sets: 6, duration: 90, restTime: 90, instructions: 'Run at conversational pace 90s, then walk 90s' },
        { name: 'Cool-down Walk', sets: 1, duration: 300, instructions: '5-min slow walk, stretch calves and quads' },
      ],
    },
  ]);

  console.log('✅ Workouts created');

  // ── NUTRITION PLANS ────────────────────────────────────────────
  await NutritionPlan.bulkCreate([
    {
      title: 'Indian Fat Loss Plan', goal: 'weight_loss',
      caloriesPerDay: 1800, proteinGrams: 140, carbsGrams: 180, fatGrams: 50,
      isPublic: true, createdBy: admin.id, creatorModel: 'Admin',
      description: 'Balanced calorie-deficit plan using common Indian foods for sustainable fat loss.',
      tags: ['weight_loss','indian_food','high_protein'],
      meals: [
        { name: 'Breakfast', time: '7:30 AM', items: [
          { name: 'Oats upma', quantity: '1 bowl (80g oats)', calories: 280, protein: 10, carbs: 48, fat: 4 },
          { name: 'Boiled eggs', quantity: '2 whole + 1 white', calories: 130, protein: 14, carbs: 0, fat: 8 },
          { name: 'Black coffee / green tea', quantity: '1 cup', calories: 5, protein: 0, carbs: 1, fat: 0 },
        ]},
        { name: 'Mid-Morning', time: '11:00 AM', items: [
          { name: 'Fruit (apple/guava)', quantity: '1 medium', calories: 80, protein: 0, carbs: 20, fat: 0 },
          { name: 'Handful of almonds', quantity: '10 pieces (15g)', calories: 90, protein: 3, carbs: 3, fat: 8 },
        ]},
        { name: 'Lunch', time: '1:30 PM', items: [
          { name: 'Grilled chicken / paneer', quantity: '150g', calories: 240, protein: 38, carbs: 2, fat: 8 },
          { name: 'Brown rice / 2 rotis', quantity: '½ cup / 2 rotis', calories: 200, protein: 5, carbs: 42, fat: 2 },
          { name: 'Dal (any)', quantity: '1 bowl (200ml)', calories: 120, protein: 8, carbs: 18, fat: 2 },
          { name: 'Mixed vegetable sabzi', quantity: '1 bowl', calories: 80, protein: 3, carbs: 12, fat: 2 },
          { name: 'Salad + buttermilk (chaas)', quantity: 'large bowl + 1 glass', calories: 80, protein: 4, carbs: 10, fat: 1 },
        ]},
        { name: 'Pre-Workout Snack', time: '5:00 PM', items: [
          { name: 'Banana', quantity: '1 medium', calories: 90, protein: 1, carbs: 23, fat: 0 },
          { name: 'Whey protein shake (water)', quantity: '1 scoop', calories: 110, protein: 24, carbs: 4, fat: 1 },
        ]},
        { name: 'Dinner', time: '8:00 PM', items: [
          { name: 'Grilled fish / tofu bhurji', quantity: '150g', calories: 200, protein: 30, carbs: 4, fat: 7 },
          { name: 'Roti (whole wheat)', quantity: '2 medium', calories: 180, protein: 6, carbs: 36, fat: 2 },
          { name: 'Palak / methi sabzi', quantity: '1 bowl', calories: 60, protein: 3, carbs: 8, fat: 2 },
        ]},
      ],
    },
    {
      title: 'Muscle Building Meal Plan', goal: 'muscle_gain',
      caloriesPerDay: 2800, proteinGrams: 200, carbsGrams: 320, fatGrams: 80,
      isPublic: true, createdBy: admin.id, creatorModel: 'Admin',
      description: 'High-protein calorie-surplus plan optimised for lean muscle building. Indian foods included.',
      tags: ['muscle_gain','high_protein','calorie_surplus'],
      meals: [
        { name: 'Breakfast', time: '7:00 AM', items: [
          { name: 'Whole eggs scrambled', quantity: '4 large', calories: 280, protein: 24, carbs: 2, fat: 20 },
          { name: 'Whole wheat toast', quantity: '3 slices', calories: 210, protein: 7, carbs: 39, fat: 3 },
          { name: 'Banana + milk', quantity: '1 medium + 250ml full fat', calories: 250, protein: 9, carbs: 38, fat: 8 },
        ]},
        { name: 'Mid-Morning', time: '10:30 AM', items: [
          { name: 'Peanut butter sandwich', quantity: '2 tbsp PB + 2 bread', calories: 380, protein: 14, carbs: 44, fat: 18 },
          { name: 'Whey protein shake', quantity: '1 scoop + 250ml milk', calories: 260, protein: 33, carbs: 16, fat: 5 },
        ]},
        { name: 'Lunch', time: '1:00 PM', items: [
          { name: 'Chicken / mutton curry (home-style)', quantity: '200g chicken', calories: 350, protein: 42, carbs: 8, fat: 16 },
          { name: 'White rice', quantity: '1.5 cups cooked', calories: 320, protein: 6, carbs: 70, fat: 1 },
          { name: 'Rajma / chhole', quantity: '1 bowl', calories: 180, protein: 10, carbs: 30, fat: 3 },
          { name: 'Curd (dahi)', quantity: '200g', calories: 120, protein: 8, carbs: 10, fat: 4 },
        ]},
        { name: 'Pre-Workout', time: '4:30 PM', items: [
          { name: 'Sweet potato / poha', quantity: '200g / 1 bowl', calories: 200, protein: 4, carbs: 45, fat: 1 },
          { name: 'Banana', quantity: '1 large', calories: 120, protein: 1, carbs: 31, fat: 0 },
        ]},
        { name: 'Post-Workout', time: '7:00 PM', items: [
          { name: 'Whey protein shake', quantity: '2 scoops + water', calories: 220, protein: 48, carbs: 8, fat: 2 },
          { name: 'Dates', quantity: '4–5 pieces', calories: 120, protein: 1, carbs: 30, fat: 0 },
        ]},
        { name: 'Dinner', time: '9:00 PM', items: [
          { name: 'Egg bhurji / paneer bhurji', quantity: '4 eggs / 150g paneer', calories: 300, protein: 28, carbs: 6, fat: 18 },
          { name: 'Roti', quantity: '3 medium', calories: 270, protein: 9, carbs: 54, fat: 3 },
          { name: 'Dal tadka', quantity: '1 bowl', calories: 150, protein: 9, carbs: 22, fat: 4 },
        ]},
      ],
    },
    {
      title: 'Balanced Maintenance Plan', goal: 'maintenance',
      caloriesPerDay: 2200, proteinGrams: 165, carbsGrams: 250, fatGrams: 65,
      isPublic: true, createdBy: admin.id, creatorModel: 'Admin',
      description: 'Well-rounded plan to maintain weight and support an active lifestyle with Indian cuisine.',
      tags: ['maintenance','balanced','indian_food'],
      meals: [
        { name: 'Breakfast', time: '8:00 AM', items: [
          { name: 'Poha / idli-sambar', quantity: '1 bowl / 3 idli + sambar', calories: 350, protein: 10, carbs: 60, fat: 6 },
          { name: 'Boiled egg', quantity: '2 large', calories: 140, protein: 12, carbs: 0, fat: 10 },
        ]},
        { name: 'Lunch', time: '1:30 PM', items: [
          { name: 'Dal rice', quantity: '1 bowl dal + 1 cup rice', calories: 440, protein: 16, carbs: 78, fat: 6 },
          { name: 'Sabzi (seasonal)', quantity: '1 bowl', calories: 100, protein: 3, carbs: 15, fat: 3 },
          { name: 'Curd or lassi (salted)', quantity: '200g / 1 glass', calories: 100, protein: 6, carbs: 8, fat: 3 },
        ]},
        { name: 'Evening Snack', time: '5:00 PM', items: [
          { name: 'Sprouts chaat / roasted makhana', quantity: '1 bowl', calories: 160, protein: 8, carbs: 24, fat: 3 },
          { name: 'Green tea / black coffee', quantity: '1 cup', calories: 5, protein: 0, carbs: 1, fat: 0 },
        ]},
        { name: 'Dinner', time: '8:00 PM', items: [
          { name: 'Chicken / fish curry or paneer', quantity: '150g', calories: 250, protein: 30, carbs: 5, fat: 12 },
          { name: 'Roti (whole wheat)', quantity: '3 medium', calories: 270, protein: 9, carbs: 54, fat: 3 },
          { name: 'Mixed dal / sambhar', quantity: '1 bowl', calories: 130, protein: 8, carbs: 18, fat: 3 },
        ]},
      ],
    },
  ]);

  console.log('✅ Nutrition plans created');

  // ── PROGRAMS — realistic Indian fitness pricing ─────────────────
  // Gym memberships: ₹800–3000/month; PT packages: ₹3000–15000/month
  // Online coaching: ₹2000–8000/month; Annual gym: ₹8000–30000
  await Program.bulkCreate([
    {
      title: 'Fat Burn Accelerator',
      description: '12-week science-backed fat loss program combining HIIT, strength training, and nutrition. Includes personalised meal plans, workout videos, and weekly trainer check-ins.',
      duration: 12, level: 'intermediate', goal: 'weight_loss',
      pricingMonthly: 2499,    // ₹2499/month - competitive online coaching
      pricingQuarterly: 5999,  // ₹5999 for 3 months (save ~20%)
      pricingPremium: 18999,   // ₹18999/year - best value (save ~37%)
      isActive: true, isFeatured: true, enrolledCount: 234, createdBy: admin.id,
      features: ['3 HIIT + 2 strength workouts/week','Personalised calorie-deficit meal plan','Weekly progress tracking & check-in','Trainer support via chat (Mon–Sat)','Full workout video library access','Nutrition guide + recipe book','Body measurements tracker'],
    },
    {
      title: 'Muscle Builder Pro',
      description: '16-week progressive overload program for serious muscle building. Periodised training, structured nutrition, and monthly video consultations with your trainer.',
      duration: 16, level: 'advanced', goal: 'muscle_gain',
      pricingMonthly: 2999,
      pricingQuarterly: 7499,
      pricingPremium: 24999,
      isActive: true, isFeatured: true, enrolledCount: 187, createdBy: admin.id,
      features: ['Periodised 4-day/week strength program','High-protein Indian meal plan (2g/kg body weight)','Supplement stack guidance','Monthly video consultation with trainer','Exercise video library with form cues','Plateau-breaking protocols','Bulk & cut phase planning'],
    },
    {
      title: 'Beginner Kickstart',
      description: '8-week foundational program for complete beginners. Covers movement basics, nutrition fundamentals, and habit building. No equipment required.',
      duration: 8, level: 'beginner', goal: 'general_fitness',
      pricingMonthly: 999,
      pricingQuarterly: 2499,
      pricingPremium: 7999,
      isActive: true, isFeatured: false, enrolledCount: 412, createdBy: admin.id,
      features: ['3 beginner-friendly workouts/week','No equipment required option','Habit and routine building guide','Balanced Indian nutrition starter plan','Daily motivation + tip of the day','Community support group access','Progress photo tracker'],
    },
    {
      title: 'Mind & Body Balance',
      description: '8-week holistic program combining yoga, mobility, and mindfulness meditation. Reduce stress, improve flexibility, and find inner balance — ideal for desk workers.',
      duration: 8, level: 'beginner', goal: 'flexibility',
      pricingMonthly: 1499,
      pricingQuarterly: 3999,
      pricingPremium: 12999,
      isActive: true, isFeatured: false, enrolledCount: 156, createdBy: admin.id,
      features: ['Daily 30-min yoga sessions (video-guided)','Guided meditation 10 min/day','Mobility and recovery routines','Stress management techniques','Anti-inflammatory diet plan','Sleep optimisation guide','Live group yoga sessions twice/week'],
    },
    {
      title: 'Elite Transformation',
      description: '24-week complete body transformation program. Dedicated personal trainer, fully customised workouts and nutrition, bi-weekly video calls, and priority 24/7 support.',
      duration: 24, level: 'intermediate', goal: 'weight_loss',
      pricingMonthly: 5999,
      pricingQuarterly: 14999,
      pricingPremium: 49999,
      isActive: true, isFeatured: true, enrolledCount: 89, createdBy: admin.id,
      features: ['Dedicated 1-on-1 personal trainer','Fully custom workout programming','Custom meal plan with Indian recipes','Bi-weekly video consultation calls','Priority support 24/7 via WhatsApp','Body composition analysis monthly','Supplement & lifestyle optimisation','Progress guarantee or money back'],
    },
  ]);

  console.log('✅ Programs created (realistic Indian pricing)');

  // ── NOTIFICATIONS ──────────────────────────────────────────────
  await Notification.bulkCreate([
    { recipientId: user1.id, recipientModel: 'User', title: 'Welcome to Mpower Fitness! 🎉', message: 'Your account is ready. Start your first workout today and begin your transformation!', type: 'system', isRead: false },
    { recipientId: user1.id, recipientModel: 'User', title: 'Trainer Assigned', message: 'Arjun Mehta has been assigned as your trainer. You can now book sessions and chat with them.', type: 'system', isRead: false },
    { recipientId: trainer1.id, recipientModel: 'Trainer', title: 'Welcome, Arjun!', message: 'Your trainer profile is live. Set your availability and start accepting clients.', type: 'system', isRead: false },
    { recipientId: trainer2.id, recipientModel: 'Trainer', title: 'Welcome, Priya!', message: 'Your trainer profile is live. Clients can now discover and book sessions with you.', type: 'system', isRead: false },
  ]);

  console.log('✅ Notifications created');


  // ── BLOGS ──────────────────────────────────────────────────────
  await Blog.bulkCreate([
    {
      title: 'The Science of Calorie Deficit: Why 500 kcal/day Works',
      slug: 'science-of-calorie-deficit',
      excerpt: 'A calorie deficit of 500 kcal/day creates sustainable fat loss of ~0.5 kg per week without muscle loss. Here\'s the science behind it.',
      content: 'Creating a calorie deficit is the cornerstone of fat loss. When you consume fewer calories than your body burns, it turns to stored fat for energy...\n\nThe 500 kcal/day rule comes from the fact that 1 kg of fat contains approximately 7,700 kcal. A consistent 500 kcal daily deficit means roughly 3,500 kcal per week — enough to lose about 0.45 kg of fat per week.\n\nThe key is sustainability. Extreme deficits (1000+ kcal/day) lead to muscle loss, fatigue, and metabolic adaptation. Moderate deficits paired with adequate protein (1.6–2.2g/kg) preserve muscle while burning fat.',
      category: 'Nutrition', tags: ['fat loss','calorie deficit','nutrition'], isPublished: true, isFeatured: true, readTime: 5,
      authorName: 'Mpower Fitness Team', publishedAt: new Date('2025-01-20'),
    },
    {
      title: 'Progressive Overload: The #1 Principle for Muscle Growth',
      slug: 'progressive-overload-muscle-growth',
      excerpt: 'If your workouts don\'t get harder over time, your muscles stop growing. This is progressive overload — and it\'s the most important training principle.',
      content: 'Progressive overload means consistently increasing the demands on your muscles over time. This can be done by increasing weight, reps, sets, or reducing rest periods.\n\nWithout progressive overload, your body adapts to the current stimulus and stops growing. This is why beginners see rapid gains — everything is new and challenging — while experienced lifters must work harder for the same results.\n\nPractical methods include adding 2.5 kg per session (linear progression for beginners), adding 1–2 reps per week, or adding an extra set every 2–3 weeks.',
      category: 'Strength', tags: ['progressive overload','muscle gain','strength training'], isPublished: true, isFeatured: true, readTime: 7,
      authorName: 'Arjun Mehta', publishedAt: new Date('2025-01-15'),
    },
    {
      title: 'The Best Indian Foods for Building Muscle',
      slug: 'indian-foods-for-muscle-building',
      excerpt: 'You don\'t need expensive supplements to build muscle. Dal, paneer, eggs, and curd are protein powerhouses available in every Indian home.',
      content: 'India has an incredibly rich food culture, and many traditional foods are excellent for muscle building.\n\nTop protein sources in Indian diet:\n\n• Eggs: 6g protein each, highly bioavailable\n• Paneer: 18g protein per 100g, vegetarian staple\n• Dal (lentils): 9g protein per 100g cooked, also rich in fibre\n• Chicken: 27g protein per 100g, versatile\n• Curd (dahi): 3–4g protein per 100g, probiotic benefits\n• Soya chunks: 52g protein per 100g (dry), highest plant protein\n\nCombine these with complex carbs like rice, roti, and oats for sustained energy and optimal muscle protein synthesis.',
      category: 'Nutrition', tags: ['indian food','muscle gain','protein','diet'], isPublished: true, isFeatured: false, readTime: 6,
      authorName: 'Mpower Nutrition Team', publishedAt: new Date('2025-01-10'),
    },
    {
      title: 'HIIT vs Steady-State Cardio: Which Burns More Fat?',
      slug: 'hiit-vs-steady-state-cardio',
      excerpt: 'Both work, but they work differently. Here\'s when to use each for maximum fat loss based on your fitness level and goals.',
      content: 'High-Intensity Interval Training (HIIT) and Steady-State Cardio (SSC) are both effective for fat loss, but through different mechanisms.\n\nHIIT burns more calories per minute and creates an "afterburn effect" (EPOC) where your metabolism stays elevated for up to 24 hours. A 20-minute HIIT session can burn as much total fat as a 45-minute jog.\n\nSteady-State Cardio is easier on joints, improves aerobic base, and is better for recovery days. Running, cycling, or swimming at 60–70% max heart rate for 30–60 minutes is sustainable long-term.\n\nBest approach: 2 HIIT sessions + 1–2 SSC sessions per week, based on recovery capacity.',
      category: 'Cardio', tags: ['HIIT','cardio','fat loss','exercise science'], isPublished: true, isFeatured: false, readTime: 5,
      authorName: 'Karthik Nair', publishedAt: new Date('2025-01-05'),
    },
    {
      title: '10 Yoga Poses That Fix Desk Worker Posture',
      slug: 'yoga-poses-fix-desk-worker-posture',
      excerpt: 'Sitting 8 hours a day wrecks your posture. These 10 yoga poses take 20 minutes and will undo most of the damage from desk work.',
      content: 'Prolonged sitting creates specific postural problems: tight hip flexors, rounded shoulders, forward head posture, and weak glutes.\n\nThe 10 Best Poses:\n1. Cat-Cow — spinal mobility\n2. Child\'s Pose — lower back release\n3. Chest Opener — counteracts rounded shoulders\n4. Hip Flexor Lunge — releases tight hip flexors\n5. Figure Four — piriformis and glute stretch\n6. Seated Forward Fold — hamstring lengthening\n7. Thoracic Extension over chair — upper back mobility\n8. Neck Side Stretch — SCM release\n9. Eagle Arms — shoulder blade mobility\n10. Legs Up the Wall — circulation and recovery\n\nDo this routine every morning or after work for best results.',
      category: 'Yoga', tags: ['yoga','posture','desk worker','flexibility'], isPublished: true, isFeatured: false, readTime: 4,
      authorName: 'Priya Sharma', publishedAt: new Date('2024-12-28'),
    },
    {
      title: 'How to Track Progress Without a Scale',
      slug: 'track-progress-without-scale',
      excerpt: 'The scale is a terrible measure of fitness progress. Here are 5 better ways to track your transformation that actually tell you something meaningful.',
      content: 'The scale measures total body mass — including water, food, muscle, and fat. A kilo gained could be muscle gain (good!) or water retention from salty food. It doesn\'t tell you your body composition is improving.\n\nBetter progress metrics:\n\n1. Body measurements (waist, hips, chest, arms, thighs)\n2. Progress photos every 4 weeks, same lighting and time of day\n3. Strength benchmarks — how much you can lift in key exercises\n4. Performance metrics — how fast you run, how long you can hold a plank\n5. How your clothes fit — especially jeans and fitted shirts\n6. Energy levels, sleep quality, and mood\n\nUse the scale as one data point, not the only one.',
      category: 'General', tags: ['progress tracking','fitness tips','body composition'], isPublished: true, isFeatured: false, readTime: 6,
      authorName: 'Mpower Fitness Team', publishedAt: new Date('2024-12-20'),
    },
  ]);

  console.log('✅ Blog posts created (6 published)');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Credentials:');
  console.log('  USER:    user@mpowerfitness.com    / User@123456');
  console.log('  TRAINER: arjun@mpowerfitness.com   / Trainer@123');
  console.log('  ADMIN:   admin@mpowerfitness.com   / Admin@123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

if (require.main === module) {
  sequelize.sync({ force: true }).then(seed).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { seed };
