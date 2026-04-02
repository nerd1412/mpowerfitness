const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { sequelize } = require('./models/index');
const { connectRedis } = require('./config/redis');
const { socketHandler } = require('./utils/socketHandler');

const authRoutes          = require('./routes/auth');
const adminRoutes         = require('./routes/admin');
const bookingsRouter      = require('./routes/bookings');
const chatRouter          = require('./routes/chat');
const workoutsRouter      = require('./routes/workouts');
const progressRouter      = require('./routes/progress');
const paymentsRouterUPI   = require('./routes/payments');
const usersRouter         = require('./routes/users');
const trainersRouter      = require('./routes/trainers');
const notificationsRouter = require('./routes/notifications');
const nutritionRouter     = require('./routes/nutrition');
const programsRouter      = require('./routes/programs');
const blogsRouter         = require('./routes/blogs');
const communityRouter     = require('./routes/community');
const consultationRouter  = require('./routes/consultation');

['avatars','workouts','progress'].forEach(dir => {
  const p = path.join(__dirname, '../uploads', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
const httpServer = createServer(app);
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'http://localhost:3000']
  : true;

const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET','POST'], credentials: true }
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization','Accept'] }));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 30 }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('io', io);
socketHandler(io);

app.get('/', (req, res) => res.json({ 
  message: 'Welcome to Mpower Fitness API', 
  status: 'Ready', 
  apiVersion: '2.1.0', 
  documentation: '/health' 
}));

app.use('/api/auth',          authRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/users',         usersRouter);
app.use('/api/trainers',      trainersRouter);
app.use('/api/bookings',      bookingsRouter);
app.use('/api/payments',      paymentsRouterUPI);
app.use('/api/workouts',      workoutsRouter);
app.use('/api/progress',      progressRouter);
app.use('/api/programs',      programsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/nutrition',     nutritionRouter);
app.use('/api/chat',          chatRouter);
app.use('/api/blogs',         blogsRouter);
app.use('/api/community',     communityRouter);
app.use('/api/consultations', consultationRouter);

app.get('/health', (req, res) => res.json({ 
  status: 'healthy', 
  service: 'Mpower Fitness API', 
  version: '2.1.0', 
  db: sequelize.getDialect(), 
  env: process.env.NODE_ENV 
}));
app.use((req, res) => res.status(404).json({ success:false, message:`Route ${req.method} ${req.path} not found` }));
app.use((err, req, res, next) => { console.error(err.stack); res.status(err.statusCode||500).json({ success:false, message: err.message||'Internal server error' }); });

const startServer = async () => {
  try {
    // In production, sync tables (alter adds columns without dropping data)
    await sequelize.sync({ alter: true });
    console.log(`✅ Database tables ready (${sequelize.getDialect()})`);
    await connectRedis();
    // Always run seeder — it guards each resource with exists() checks
    const { seed } = require('./utils/seeder');
    await seed();
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => console.log(`🚀 API → http://localhost:${PORT}`));
  } catch (err) { console.error('Startup error:', err); process.exit(1); }
};

if (require.main === module) startServer();
else sequelize.sync({ alter: true }).catch(e => console.warn('DB sync:', e.message));

module.exports = { app, io, startServer };
