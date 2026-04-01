import api from '../utils/api';

// ── Auth ─────────────────────────────────────────────────────
export const authService = {
  me: () => api.get('/auth/me'),
};

// ── Users ────────────────────────────────────────────────────
export const userService = {
  dashboard: () => api.get('/users/dashboard'),
  me: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// ── Workouts ─────────────────────────────────────────────────
export const workoutService = {
  getAll: (params) => api.get('/workouts', { params }),
  getOne: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  logSession: (data) => api.post('/workouts/sessions/log', data),
  getMySessions: (params) => api.get('/workouts/sessions/my', { params }),
};

// ── Progress ─────────────────────────────────────────────────
export const progressService = {
  getAll: (params) => api.get('/progress/my', { params }),
  log: (data) => api.post('/progress', data),
  delete: (id) => api.delete(`/progress/${id}`),
  stats: () => api.get('/progress/stats/summary'),
};

// ── Trainers ─────────────────────────────────────────────────
export const trainerService = {
  getAll: (params) => api.get('/trainers', { params }),
  getProfile: () => api.get('/trainers/profile'),
  updateProfile: (data) => api.put('/trainers/profile', data),
  updateAvailability: (availability) => api.put('/trainers/availability', { availability }),
  getMyClients: () => api.get('/trainers/my-clients'),
};

// ── Bookings ─────────────────────────────────────────────────
export const bookingService = {
  getAvailability: (trainerId, date) =>
    api.get(`/bookings/trainer/${trainerId}/availability`, { params: { date } }),
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getTrainerSchedule: (params) => api.get('/bookings/trainer-schedule', { params }),
  updateStatus: (id, data) => api.patch(`/bookings/${id}/status`, data),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  rate: (id, data) => api.post(`/bookings/${id}/rate`, data),
};

// ── Programs ─────────────────────────────────────────────────
export const programService = {
  getAll: () => api.get('/programs'),
  getOne: (id) => api.get(`/programs/${id}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
};

// ── Nutrition ────────────────────────────────────────────────
export const nutritionService = {
  getAll: () => api.get('/nutrition'),
  create: (data) => api.post('/nutrition', data),
  update: (id, data) => api.put(`/nutrition/${id}`, data),
  delete: (id) => api.delete(`/nutrition/${id}`),
};

// ── Payments ─────────────────────────────────────────────────
export const paymentService = {
  initiateUpi: (data) => api.post('/payments/upi/initiate', data),
  verifyUpi: (data) => api.post('/payments/upi/verify', data),
  getStatus: (ref) => api.get(`/payments/upi/status/${ref}`),
};

// ── Notifications ────────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ── Chat ─────────────────────────────────────────────────────
export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  sendMessage: (data) => api.post('/chat/send', data),
  getMessages: (conversationId, params) =>
    api.get(`/chat/${conversationId}/messages`, { params }),
};

// ── Blogs ────────────────────────────────────────────────────
export const blogService = {
  getAll: (params) => api.get('/blogs', { params }),
  getOne: (slug) => api.get(`/blogs/${slug}`),
};

// ── Admin ────────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getTrainers: (params) => api.get('/admin/trainers', { params }),
  approveTrainer: (id) => api.patch(`/admin/trainers/${id}/approve`),
  rejectTrainer: (id, reason) => api.patch(`/admin/trainers/${id}/reject`, { reason }),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  getUpiSettings: () => api.get('/admin/settings/upi'),
  updateUpiSettings: (data) => api.put('/admin/settings/upi', data),
  getBlogs: () => api.get('/admin/blogs'),
  createBlog: (data) => api.post('/admin/blogs', data),
  updateBlog: (id, data) => api.put(`/admin/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};
