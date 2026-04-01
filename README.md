# Mpower Fitness Platform — Production Setup Guide

## Quick Start

```bash
# 1. Backend
cd backend
npm install
npm run dev        # starts on port 5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm start          # starts on port 3000
```

App: http://localhost:3000 | API: http://localhost:5000/health

## Demo Credentials

| Role    | Email                         | Password      |
|---------|-------------------------------|---------------|
| User    | user@mpowerfitness.com        | User@123456   |
| Trainer | arjun@mpowerfitness.com       | Trainer@123   |
| Admin   | admin@mpowerfitness.com       | Admin@123456  |

## Database

- Development: SQLite (auto-created at `backend/data/mpower.sqlite`)
- First run: DB is seeded automatically with demo data (4 trainers, 2 users, 6 workouts, 3 nutrition plans, 5 programs, 6 blog posts)
- Reset DB: `cd backend && npm run seed:reset`
- Production: Set `DATABASE_URL=postgresql://...` in `.env`

## Environment Variables

### Backend (`backend/.env`)
```
NODE_ENV=development
PORT=5000
SQLITE_PATH=./data/mpower.sqlite
JWT_SECRET=mpower_jwt_secret_dev_key_change_in_production_min64chars_abcdef12
JWT_REFRESH_SECRET=mpower_refresh_secret_dev_key_change_in_production_min64chars_xy
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Features

### User
- Dashboard with stats, weekly activity chart, streak tracking
- Workout library with filtering (category + difficulty + search) — client-side for instant results
- Workout detail with live session timer, exercise tracking, completion logging
- Find Trainer — search by name, city, specialization; book sessions via UPI
- Nutrition plans — public + assigned plans with full meal breakdowns
- Progress tracking — weight, body fat, measurements chart
- Programs — subscription plans with UPI payment
- Chat — real-time messaging with assigned trainer
- Profile — assigned trainer card, subscription status

### Trainer
- Dashboard with earnings, sessions, pending bookings
- Client management — view clients, message them
- Schedule management — set available slots per day
- Bookings — confirm/decline/complete sessions
- Nutrition — create plans, assign to clients
- Analytics — earnings chart, performance metrics
- Chat — message with clients
- Profile — update rates, city, bio, UPI ID

### Admin
- Full CRUD: Users, Trainers, Workouts, Nutrition, Programs, Bookings, Blog
- Add trainers directly with immediate approval option
- Plan-based access control (under Programs → ⚙️ Access Rules)
- UPI settings (under Payments)
- Revenue analytics
- Send notifications to users/trainers
- Blog management — create/edit/publish/unpublish posts

## Tech Stack

- **Frontend**: React 18, React Router 6, Zustand, Recharts, Socket.IO client, Axios
- **Backend**: Node.js, Express, Sequelize ORM, SQLite/PostgreSQL, Socket.IO, JWT, bcryptjs
- **Payments**: UPI deep links (GPay, PhonePe, Paytm) + UTR verification

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Set `DATABASE_URL` to your PostgreSQL connection string
3. Build frontend: `cd frontend && npm run build`
4. Serve build via nginx or `serve -s build`
5. Use PM2 for backend: `pm2 start src/server.js --name mpower-api`
