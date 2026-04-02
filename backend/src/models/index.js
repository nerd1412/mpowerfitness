const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const jsonField = (defaultVal = '[]') => ({
  type: DataTypes.TEXT,
  defaultValue: defaultVal,
  get() {
    try { return JSON.parse(this.getDataValue(this._modelOptions.name.singular + '_json') || this.getDataValue(arguments[0]) || defaultVal); }
    catch { return JSON.parse(defaultVal); }
  }
});

// Helper for JSON columns
const json = (def = '[]') => ({
  type: DataTypes.TEXT,
  defaultValue: def,
  get() {
    try { const v = this.getDataValue(this.constructor._getColName ? this.constructor._getColName() : null); return JSON.parse(v || def); }
    catch { return JSON.parse(def); }
  }
});

const J = (col, def = '[]') => ({
  type: DataTypes.TEXT,
  defaultValue: def,
  get() { try { return JSON.parse(this.getDataValue(col) || def); } catch { return JSON.parse(def); } },
  set(v) { this.setDataValue(col, JSON.stringify(v)); }
});

// ==================== USER ====================
const User = sequelize.define('User', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:      { type: DataTypes.STRING, allowNull: false },
  email:     { type: DataTypes.STRING, allowNull: false, unique: true },
  password:  { type: DataTypes.STRING, allowNull: false },
  phone:     DataTypes.STRING,
  avatar:    DataTypes.STRING,
  isActive:  { type: DataTypes.BOOLEAN, defaultValue: true },
  onboardingCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  fitnessGoal:  { type: DataTypes.STRING, defaultValue: 'general_fitness' },
  fitnessLevel: { type: DataTypes.STRING, defaultValue: 'beginner' },
  lifestyle:    { type: DataTypes.STRING, defaultValue: 'sedentary' },
  preferredWorkoutTime: DataTypes.STRING,
  workoutDaysPerWeek:   { type: DataTypes.INTEGER, defaultValue: 3 },
  age:    DataTypes.INTEGER,
  gender: DataTypes.STRING,
  height: DataTypes.FLOAT,
  weight: DataTypes.FLOAT,
  targetWeight: DataTypes.FLOAT,
  subscriptionPlan:      { type: DataTypes.STRING, defaultValue: 'free' },
  subscriptionStartDate: DataTypes.DATE,
  subscriptionEndDate:   DataTypes.DATE,
  subscriptionActive:    { type: DataTypes.BOOLEAN, defaultValue: false },
  assignedTrainerId:     DataTypes.UUID,
  city:          { type: DataTypes.STRING, defaultValue: '' },
  state:         { type: DataTypes.STRING, defaultValue: '' },
  streak:              { type: DataTypes.INTEGER, defaultValue: 0 },
  longestStreak:       { type: DataTypes.INTEGER, defaultValue: 0 },
  lastWorkoutDate:     DataTypes.DATE,
  totalWorkouts:       { type: DataTypes.INTEGER, defaultValue: 0 },
  totalCaloriesBurned: { type: DataTypes.INTEGER, defaultValue: 0 },
  points:              { type: DataTypes.INTEGER, defaultValue: 0 },
  badges:           { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('badges')); } catch { return []; } }, set(v) { this.setDataValue('badges', JSON.stringify(v)); } },
  healthConditions: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('healthConditions')); } catch { return []; } }, set(v) { this.setDataValue('healthConditions', JSON.stringify(v)); } },
  budgetSegment:    { type: DataTypes.STRING, defaultValue: 'mid' }, // budget | mid | premium
  deliveryPreference: { type: DataTypes.STRING, defaultValue: 'online' }, // online | home | mpower_gym | partner_gym | self_guided
  consultationDone: { type: DataTypes.BOOLEAN, defaultValue: false },
  refreshToken: DataTypes.TEXT,
  lastLogin:    DataTypes.DATE,
}, { tableName: 'users' });

// ==================== TRAINER ====================
const Trainer = sequelize.define('Trainer', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone:    DataTypes.STRING,
  avatar:   DataTypes.STRING,
  isActive:   { type: DataTypes.BOOLEAN, defaultValue: true },
  isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
  specializations: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('specializations')); } catch { return []; } }, set(v) { this.setDataValue('specializations', JSON.stringify(v)); } },
  certifications:  { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('certifications')); } catch { return []; } }, set(v) { this.setDataValue('certifications', JSON.stringify(v)); } },
  experience:  { type: DataTypes.INTEGER, defaultValue: 0 },
  bio:         DataTypes.TEXT,
  sessionRate: { type: DataTypes.FLOAT, defaultValue: 500 },
  monthlyRate: { type: DataTypes.FLOAT, defaultValue: 3000 },
  availability: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('availability')); } catch { return []; } }, set(v) { this.setDataValue('availability', JSON.stringify(v)); } },
  maxClients:    { type: DataTypes.INTEGER, defaultValue: 20 },
  rating:        { type: DataTypes.FLOAT, defaultValue: 0 },
  totalRatings:  { type: DataTypes.INTEGER, defaultValue: 0 },
  totalSessions: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
  clients:       { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('clients')); } catch { return []; } }, set(v) { this.setDataValue('clients', JSON.stringify(v)); } },
  upiId:         DataTypes.STRING,
  city:          { type: DataTypes.STRING, defaultValue: '' },
  state:         { type: DataTypes.STRING, defaultValue: '' },
  country:       { type: DataTypes.STRING, defaultValue: 'India' },
  locationText:  DataTypes.STRING,
  isOnline:      { type: DataTypes.BOOLEAN, defaultValue: true },
  refreshToken:  DataTypes.TEXT,
  lastLogin:     DataTypes.DATE,
}, { tableName: 'trainers' });

// ==================== ADMIN ====================
const Admin = sequelize.define('Admin', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING, allowNull: false },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  avatar:   DataTypes.STRING,
  role:     { type: DataTypes.STRING, defaultValue: 'admin' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  permissions: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('permissions')); } catch { return []; } }, set(v) { this.setDataValue('permissions', JSON.stringify(v)); } },
  upiId:    { type: DataTypes.STRING, defaultValue: 'payments@mpowerfitness' },
  upiName:  { type: DataTypes.STRING, defaultValue: 'Mpower Fitness' },
  refreshToken: DataTypes.TEXT,
  lastLogin:    DataTypes.DATE,
}, { tableName: 'admins' });

// ==================== WORKOUT ====================
const Workout = sequelize.define('Workout', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:       { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  category:    { type: DataTypes.STRING, allowNull: false },
  difficulty:  { type: DataTypes.STRING, allowNull: false },
  duration:    { type: DataTypes.INTEGER, allowNull: false },
  caloriesBurn: DataTypes.INTEGER,
  thumbnail:   DataTypes.STRING,
  videoUrl:    DataTypes.STRING,
  exercises:   { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('exercises')); } catch { return []; } }, set(v) { this.setDataValue('exercises', JSON.stringify(v)); } },
  tags:        { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } }, set(v) { this.setDataValue('tags', JSON.stringify(v)); } },
  targetGoals: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('targetGoals')); } catch { return []; } }, set(v) { this.setDataValue('targetGoals', JSON.stringify(v)); } },
  equipment:   { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('equipment')); } catch { return []; } }, set(v) { this.setDataValue('equipment', JSON.stringify(v)); } },
  createdBy:    DataTypes.UUID,
  creatorModel: DataTypes.STRING,
  isPublic:    { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured:  { type: DataTypes.BOOLEAN, defaultValue: false },
  likes:       { type: DataTypes.INTEGER, defaultValue: 0 },
  completions: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'workouts' });

// ==================== WORKOUT SESSION ====================
const WorkoutSession = sequelize.define('WorkoutSession', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  workoutId:   DataTypes.UUID,
  workoutName: DataTypes.STRING,
  startTime:   { type: DataTypes.DATE, allowNull: false },
  endTime:     DataTypes.DATE,
  duration:    DataTypes.INTEGER,
  caloriesBurned: { type: DataTypes.INTEGER, defaultValue: 0 },
  exercisesCompleted: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('exercisesCompleted')); } catch { return []; } }, set(v) { this.setDataValue('exercisesCompleted', JSON.stringify(v)); } },
  notes:    DataTypes.TEXT,
  mood:     DataTypes.STRING,
  completionRate: { type: DataTypes.INTEGER, defaultValue: 0 },
  trainedBy: DataTypes.UUID,
  bookingId: DataTypes.UUID,
}, { tableName: 'workout_sessions' });

// ==================== BOOKING ====================
const Booking = sequelize.define('Booking', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  trainerId:   { type: DataTypes.UUID, allowNull: false },
  sessionDate: { type: DataTypes.DATEONLY, allowNull: false },
  startTime:   { type: DataTypes.STRING, allowNull: false },
  endTime:     { type: DataTypes.STRING, allowNull: false },
  duration:    { type: DataTypes.INTEGER, defaultValue: 60 },
  status:      { type: DataTypes.STRING, defaultValue: 'pending' },
  sessionType: { type: DataTypes.STRING, defaultValue: 'online' },
  amount:      { type: DataTypes.FLOAT, allowNull: false },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'pending' },
  paymentId:   DataTypes.STRING,
  notes:       DataTypes.TEXT,
  trainerNotes: DataTypes.TEXT,
  cancellationReason: DataTypes.TEXT,
  cancelledBy: DataTypes.STRING,
  rating:      DataTypes.INTEGER,
  review:      DataTypes.TEXT,
}, { tableName: 'bookings' });

// ==================== PROGRESS ====================
const Progress = sequelize.define('Progress', {
  id:     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  date:   { type: DataTypes.DATEONLY, allowNull: false },
  weight:    DataTypes.FLOAT,
  bodyFat:   DataTypes.FLOAT,
  muscleMass: DataTypes.FLOAT,
  measurements: { type: DataTypes.TEXT, defaultValue: '{}', get() { try { return JSON.parse(this.getDataValue('measurements')); } catch { return {}; } }, set(v) { this.setDataValue('measurements', JSON.stringify(v)); } },
  caloriesConsumed: DataTypes.INTEGER,
  caloriesBurned:   DataTypes.INTEGER,
  waterIntake: DataTypes.FLOAT,
  sleepHours:  DataTypes.FLOAT,
  mood:        DataTypes.STRING,
  energyLevel: DataTypes.INTEGER,
  notes:       DataTypes.TEXT,
}, { tableName: 'progress' });

// ==================== NUTRITION PLAN ====================
const NutritionPlan = sequelize.define('NutritionPlan', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:       { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  goal:        DataTypes.STRING,
  caloriesPerDay: DataTypes.INTEGER,
  proteinGrams:   DataTypes.INTEGER,
  carbsGrams:     DataTypes.INTEGER,
  fatGrams:       DataTypes.INTEGER,
  meals:       { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('meals')); } catch { return []; } }, set(v) { this.setDataValue('meals', JSON.stringify(v)); } },
  tags:        { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } }, set(v) { this.setDataValue('tags', JSON.stringify(v)); } },
  createdBy:    DataTypes.UUID,
  creatorModel: DataTypes.STRING,
  isPublic:    { type: DataTypes.BOOLEAN, defaultValue: false },
  assignedTo:  { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('assignedTo')); } catch { return []; } }, set(v) { this.setDataValue('assignedTo', JSON.stringify(v)); } },
}, { tableName: 'nutrition_plans' });

// ==================== PROGRAM ====================
const Program = sequelize.define('Program', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:       { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  duration:    DataTypes.INTEGER,
  level:       DataTypes.STRING,
  goal:        DataTypes.STRING,
  thumbnail:   DataTypes.STRING,
  pricingMonthly:   { type: DataTypes.FLOAT, defaultValue: 999 },
  pricingQuarterly: { type: DataTypes.FLOAT, defaultValue: 2499 },
  pricingPremium:   { type: DataTypes.FLOAT, defaultValue: 4999 },
  features:    { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('features')); } catch { return []; } }, set(v) { this.setDataValue('features', JSON.stringify(v)); } },
  workoutIds:  { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('workoutIds')); } catch { return []; } }, set(v) { this.setDataValue('workoutIds', JSON.stringify(v)); } },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured:  { type: DataTypes.BOOLEAN, defaultValue: false },
  enrolledCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  createdBy:   DataTypes.UUID,
}, { tableName: 'programs' });

// ==================== PAYMENT ====================
const Payment = sequelize.define('Payment', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:   { type: DataTypes.UUID, allowNull: false },
  amount:   { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: 'INR' },
  type:     { type: DataTypes.STRING, allowNull: false },
  status:   { type: DataTypes.STRING, defaultValue: 'created' },
  transactionRef: DataTypes.STRING,
  utrNumber:      DataTypes.STRING,
  senderUpiId:    DataTypes.STRING,
  subscriptionPlan: DataTypes.STRING,
  bookingId:  DataTypes.UUID,
  programId:  DataTypes.UUID,
  description: DataTypes.STRING,
  failureReason: DataTypes.STRING,
}, { tableName: 'payments' });

// ==================== MESSAGE ====================
const Message = sequelize.define('Message', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  conversationId: { type: DataTypes.UUID, allowNull: false },
  senderId:       { type: DataTypes.UUID, allowNull: false },
  senderModel:    DataTypes.STRING,
  content:        { type: DataTypes.TEXT, allowNull: false },
  type:           { type: DataTypes.STRING, defaultValue: 'text' },
  fileUrl:        DataTypes.STRING,
  isRead:         { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:         DataTypes.DATE,
}, { tableName: 'messages' });

// ==================== CONVERSATION ====================
const Conversation = sequelize.define('Conversation', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  participants: { type: DataTypes.TEXT, allowNull: false, get() { try { return JSON.parse(this.getDataValue('participants')); } catch { return []; } }, set(v) { this.setDataValue('participants', JSON.stringify(v)); } },
  lastMessageId: DataTypes.UUID,
  lastMessageAt: DataTypes.DATE,
  unreadCounts:  { type: DataTypes.TEXT, defaultValue: '{}', get() { try { return JSON.parse(this.getDataValue('unreadCounts')); } catch { return {}; } }, set(v) { this.setDataValue('unreadCounts', JSON.stringify(v)); } },
}, { tableName: 'conversations' });

// ==================== NOTIFICATION ====================
const Notification = sequelize.define('Notification', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  recipientId:    { type: DataTypes.UUID, allowNull: false },
  recipientModel: DataTypes.STRING,
  title:          { type: DataTypes.STRING, allowNull: false },
  message:        { type: DataTypes.TEXT, allowNull: false },
  type:           DataTypes.STRING,
  isRead:         { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:         DataTypes.DATE,
  data:           { type: DataTypes.TEXT, defaultValue: '{}', get() { try { return JSON.parse(this.getDataValue('data')); } catch { return {}; } }, set(v) { this.setDataValue('data', JSON.stringify(v)); } },
  actionUrl:      DataTypes.STRING,
}, { tableName: 'notifications' });


// ==================== BLOG ====================
const Blog = sequelize.define('Blog', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title:       { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, allowNull: false, unique: true },
  excerpt:     { type: DataTypes.TEXT },
  content:     { type: DataTypes.TEXT },
  category:    { type: DataTypes.STRING, defaultValue: 'General' },
  coverImage:  { type: DataTypes.STRING },
  authorId:    { type: DataTypes.UUID },
  authorName:  { type: DataTypes.STRING, defaultValue: 'Mpower Team' },
  tags:        { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } }, set(v) { this.setDataValue('tags', JSON.stringify(v)); } },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  isFeatured:  { type: DataTypes.BOOLEAN, defaultValue: false },
  readTime:    { type: DataTypes.INTEGER, defaultValue: 5 },
  views:       { type: DataTypes.INTEGER, defaultValue: 0 },
  publishedAt: { type: DataTypes.DATE },
}, { tableName: 'blogs' });

// ==================== COMMUNITY GROUP ====================
const CommunityGroup = sequelize.define('CommunityGroup', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false },
  slug:        { type: DataTypes.STRING, allowNull: false, unique: true },
  description: DataTypes.TEXT,
  condition:   DataTypes.STRING,           // pcod, diabetes, thyroid, hypertension, joint_pain, general
  icon:        { type: DataTypes.STRING, defaultValue: '💪' },
  color:       { type: DataTypes.STRING, defaultValue: '#C8F135' },
  memberCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isActive:    { type: DataTypes.BOOLEAN, defaultValue: true },
  isFeatured:  { type: DataTypes.BOOLEAN, defaultValue: false },
  rules:       { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('rules')); } catch { return []; } }, set(v) { this.setDataValue('rules', JSON.stringify(v)); } },
}, { tableName: 'community_groups' });

// ==================== COMMUNITY POST ====================
const CommunityPost = sequelize.define('CommunityPost', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  groupId:   { type: DataTypes.UUID, allowNull: false },
  authorId:  { type: DataTypes.UUID, allowNull: false },
  authorName:{ type: DataTypes.STRING, allowNull: false },
  authorRole:{ type: DataTypes.STRING, defaultValue: 'user' },
  content:   { type: DataTypes.TEXT, allowNull: false },
  type:      { type: DataTypes.STRING, defaultValue: 'discussion' }, // discussion | milestone | question | resource
  tags:      { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('tags')); } catch { return []; } }, set(v) { this.setDataValue('tags', JSON.stringify(v)); } },
  likes:     { type: DataTypes.INTEGER, defaultValue: 0 },
  likedBy:   { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('likedBy')); } catch { return []; } }, set(v) { this.setDataValue('likedBy', JSON.stringify(v)); } },
  isPinned:  { type: DataTypes.BOOLEAN, defaultValue: false },
  isApproved:{ type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'community_posts' });

// ==================== CONSULTATION REQUEST ====================
const ConsultationRequest = sequelize.define('ConsultationRequest', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:           DataTypes.UUID,
  name:             { type: DataTypes.STRING, allowNull: false },
  email:            { type: DataTypes.STRING, allowNull: false },
  phone:            DataTypes.STRING,
  age:              DataTypes.INTEGER,
  gender:           DataTypes.STRING,
  healthConditions: { type: DataTypes.TEXT, defaultValue: '[]', get() { try { return JSON.parse(this.getDataValue('healthConditions')); } catch { return []; } }, set(v) { this.setDataValue('healthConditions', JSON.stringify(v)); } },
  primaryGoal:      DataTypes.STRING,
  currentChallenges:DataTypes.TEXT,
  fitnessLevel:     DataTypes.STRING,
  budgetSegment:    DataTypes.STRING,
  deliveryPreference:DataTypes.STRING,
  status:           { type: DataTypes.STRING, defaultValue: 'pending' }, // pending | reviewed | assigned | closed
  adminNotes:       DataTypes.TEXT,
  assignedTrainerId:DataTypes.UUID,
}, { tableName: 'consultation_requests' });

module.exports = {
  sequelize, User, Trainer, Admin, Blog,
  Workout, WorkoutSession, Booking, Progress,
  NutritionPlan, Program, Payment, Message, Conversation, Notification,
  CommunityGroup, CommunityPost, ConsultationRequest,
};
