/**
 * bookingApi — Single Responsibility: all booking-related HTTP calls.
 * Centralises booking logic so route changes are a single edit here.
 */
import api from '../utils/api';

const bookingApi = {
  /** Create a new session booking */
  create: (booking) =>
    api.post('/bookings', booking).then(r => r.data),

  /** Get all bookings for the logged-in user */
  getMyBookings: () =>
    api.get('/bookings/my-bookings').then(r => r.data.bookings || []),

  /** Get all bookings for the logged-in trainer */
  getTrainerSchedule: () =>
    api.get('/bookings/trainer-schedule').then(r => r.data.bookings || []),

  /** Update a booking's status (confirm / cancel / complete) */
  updateStatus: (id, status) =>
    api.patch(`/bookings/${id}/status`, { status }).then(r => r.data),
};

export default bookingApi;
