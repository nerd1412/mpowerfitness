import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  userService, workoutService, progressService,
  bookingService, trainerService, programService,
  nutritionService, notificationService, adminService,
} from '../services/index';

// ── Auth / User ───────────────────────────────────────────────
export const useUserDashboard = () =>
  useQuery({ queryKey: ['user', 'dashboard'], queryFn: () => userService.dashboard().then(r => r.data.data) });

export const useUserMe = () =>
  useQuery({ queryKey: ['user', 'me'], queryFn: () => userService.me().then(r => r.data.user) });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user'] }); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

// ── Workouts ─────────────────────────────────────────────────
export const useWorkouts = (params) =>
  useQuery({ queryKey: ['workouts', params], queryFn: () => workoutService.getAll(params).then(r => r.data) });

export const useWorkout = (id) =>
  useQuery({ queryKey: ['workout', id], queryFn: () => workoutService.getOne(id).then(r => r.data.workout), enabled: !!id });

export const useMySessions = (params) =>
  useQuery({ queryKey: ['sessions', 'my', params], queryFn: () => workoutService.getMySessions(params).then(r => r.data.sessions) });

export const useLogSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => workoutService.logSession(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sessions'] });
      qc.invalidateQueries({ queryKey: ['user', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      if (res.data.newBadges?.length) {
        res.data.newBadges.forEach(b => toast.success(`🏅 Badge earned: ${b.name}!`));
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log session'),
  });
};

// ── Progress ─────────────────────────────────────────────────
export const useProgress = (params) =>
  useQuery({ queryKey: ['progress', params], queryFn: () => progressService.getAll(params).then(r => r.data.progress) });

export const useProgressStats = () =>
  useQuery({ queryKey: ['progress', 'stats'], queryFn: () => progressService.stats().then(r => r.data) });

export const useLogProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => progressService.log(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['progress'] }); toast.success('Progress logged! 📊'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log progress'),
  });
};

export const useDeleteProgress = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => progressService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['progress'] }); toast.success('Entry deleted'); },
    onError: () => toast.error('Failed to delete entry'),
  });
};

// ── Bookings ─────────────────────────────────────────────────
export const useMyBookings = (params) =>
  useQuery({ queryKey: ['bookings', 'my', params], queryFn: () => bookingService.getMy(params).then(r => r.data.bookings) });

export const useTrainerSchedule = (params) =>
  useQuery({ queryKey: ['bookings', 'schedule', params], queryFn: () => bookingService.getTrainerSchedule(params).then(r => r.data.bookings) });

export const useTrainerAvailability = (trainerId, date) =>
  useQuery({
    queryKey: ['availability', trainerId, date],
    queryFn: () => bookingService.getAvailability(trainerId, date).then(r => r.data),
    enabled: !!trainerId,
  });

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => bookingService.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Session booked! 🎉'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Booking failed'),
  });
};

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => bookingService.cancel(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Booking cancelled'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to cancel'),
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => bookingService.updateStatus(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`Booking ${vars.status}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

export const useRateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => bookingService.rate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Rating submitted! ⭐'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit rating'),
  });
};

// ── Trainers ─────────────────────────────────────────────────
export const useTrainers = (params) =>
  useQuery({ queryKey: ['trainers', params], queryFn: () => trainerService.getAll(params).then(r => r.data.trainers) });

export const useMyClients = () =>
  useQuery({ queryKey: ['trainer', 'clients'], queryFn: () => trainerService.getMyClients().then(r => r.data.clients) });

export const useUpdateTrainerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => trainerService.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trainer'] }); toast.success('Profile updated!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });
};

export const useUpdateAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (availability) => trainerService.updateAvailability(availability),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trainer'] }); toast.success('Schedule saved!'); },
    onError: () => toast.error('Failed to save schedule'),
  });
};

// ── Programs ─────────────────────────────────────────────────
export const usePrograms = () =>
  useQuery({ queryKey: ['programs'], queryFn: () => programService.getAll().then(r => r.data.programs) });

// ── Nutrition ─────────────────────────────────────────────────
export const useNutrition = () =>
  useQuery({ queryKey: ['nutrition'], queryFn: () => nutritionService.getAll().then(r => r.data.plans) });

// ── Notifications ─────────────────────────────────────────────
export const useNotifications = (params) =>
  useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getAll(params).then(r => r.data),
    refetchInterval: 60000, // poll every 60s
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
};

// ── Admin ──────────────────────────────────────────────────────
export const useAdminDashboard = () =>
  useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => adminService.getDashboard().then(r => r.data.data) });

export const useAdminUsers = (params) =>
  useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminService.getUsers(params).then(r => r.data) });

export const useAdminTrainers = (params) =>
  useQuery({ queryKey: ['admin', 'trainers', params], queryFn: () => adminService.getTrainers(params).then(r => r.data) });

export const useApproveTrainer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.approveTrainer(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'trainers'] }); toast.success('Trainer approved!'); },
    onError: () => toast.error('Failed to approve trainer'),
  });
};

export const useRejectTrainer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminService.rejectTrainer(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'trainers'] }); toast.success('Trainer rejected'); },
    onError: () => toast.error('Failed to reject trainer'),
  });
};

export const useAdminAnalytics = (params) =>
  useQuery({ queryKey: ['admin', 'analytics', params], queryFn: () => adminService.getAnalytics(params).then(r => r.data) });
