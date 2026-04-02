/**
 * trainerApi — Single Responsibility: all trainer-related HTTP calls.
 * Pages and hooks import from here, never calling `api` directly for trainer data.
 * Adding a new trainer endpoint = one change here, zero changes in components.
 */
import api from '../utils/api';

const trainerApi = {
  /** Fetch a single trainer by ID */
  getById: (id) =>
    api.get(`/trainers/${id}`).then(r => r.data.trainer || r.data),

  /** Fetch all public trainers */
  getAll: () =>
    api.get('/trainers').then(r => r.data.trainers || []),

  /**
   * Fetch trainer's weekly availability template.
   * When `date` is provided, also returns bookedSlots for that date.
   */
  getAvailability: (trainerId, date) => {
    const url = date
      ? `/bookings/trainer/${trainerId}/availability?date=${date}`
      : `/bookings/trainer/${trainerId}/availability`;
    return api.get(url).then(r => r.data);
  },

  /** Save trainer's weekly availability template */
  updateAvailability: (availability) =>
    api.put('/trainers/availability', { availability }).then(r => r.data),

  /** Trainer's own profile */
  getMe: () =>
    api.get('/auth/me').then(r => r.data.user),

  /** Fetch all clients assigned to the logged-in trainer */
  getMyClients: () =>
    api.get('/trainers/my-clients').then(r => r.data.clients || []),

  /** Assign a nutrition plan to a client */
  assignNutrition: (planId, userId) =>
    api.post('/trainers/assign-nutrition', { planId, userId }).then(r => r.data),
};

export default trainerApi;
