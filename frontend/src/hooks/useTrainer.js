/**
 * useTrainer hooks — Dependency Inversion: components depend on this abstraction,
 * not on raw API calls. Swap the service implementation without touching any component.
 */
import { useState, useEffect, useMemo } from 'react';
import trainerApi from '../services/trainerApi';

const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/** Fetch the trainer assigned to the logged-in user. */
export const useAssignedTrainer = (assignedId) => {
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!assignedId) { setLoading(false); return; }

    trainerApi.getById(assignedId)
      .then(setTrainer)
      .catch(() =>
        // Fallback: search all trainers
        trainerApi.getAll()
          .then(trainers => setTrainer(trainers.find(t => (t.id || t._id) === assignedId) || null))
          .catch(e => setError(e.message || 'Failed to load trainer'))
      )
      .finally(() => setLoading(false));
  }, [assignedId]);

  return { trainer, loading, error };
};

/** Fetch a trainer's weekly availability template. */
export const useTrainerAvailability = (trainer) => {
  const [avail, setAvail] = useState(null);

  useEffect(() => {
    if (!trainer) return;
    const tid = trainer.id || trainer._id;
    trainerApi.getAvailability(tid)
      .then(data => { if (data.success) setAvail(data.availability); })
      .catch(() => {});
  }, [trainer]);

  return avail;
};

/**
 * Fetch booked slots for a specific date and derive available time slots.
 * Returns { slotsForDate, bookedSlots } derived from the weekly template and existing bookings.
 */
export const useDateSlots = (trainer, avail, bookDate) => {
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    if (!trainer || !bookDate) { setBookedSlots([]); return; }
    const tid = trainer.id || trainer._id;
    trainerApi.getAvailability(tid, bookDate)
      .then(data => { if (data.success) setBookedSlots(data.bookedSlots || []); })
      .catch(() => {});
  }, [trainer, bookDate]);

  const slotsForDate = useMemo(() => {
    if (!bookDate || !avail) return [];
    const dayName = DAYS[new Date(bookDate + 'T12:00:00').getDay()];
    const dayAvail = avail.find(a => a.day === dayName);
    return (dayAvail?.slots || []).filter(
      s => !bookedSlots.some(b => b.startTime === s.startTime)
    );
  }, [bookDate, avail, bookedSlots]);

  return { slotsForDate, bookedSlots };
};

/**
 * Build a list of upcoming dates (next N days) that have trainer availability.
 * Only returns dates with at least one slot — caller can show "no availability" if empty.
 */
export const useAvailableDates = (avail, daysAhead = 21) => {
  return useMemo(() => {
    const dates = [];
    for (let i = 1; i <= daysAhead; i++) {
      const d = new Date(Date.now() + i * 86400000);
      const dayName = DAYS[d.getDay()];
      const dayAvail = avail?.find(a => a.day === dayName);
      if (!(dayAvail?.slots?.length > 0)) continue; // only include available days
      dates.push({
        date: d.toISOString().split('T')[0],
        dayShort: d.toLocaleDateString('en-IN', { weekday: 'short' }),
        num: d.getDate(),
        monthShort: d.toLocaleDateString('en-IN', { month: 'short' }),
      });
    }
    return dates;
  }, [avail, daysAhead]);
};
