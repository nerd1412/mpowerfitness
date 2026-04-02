/**
 * nutritionApi — Single Responsibility: all nutrition plan HTTP calls.
 */
import api from '../utils/api';

const nutritionApi = {
  /** All public plans + plans assigned to the logged-in user */
  getMyPlans: () =>
    api.get('/nutrition').then(r => r.data.plans || []),

  /** Plans created by the logged-in trainer */
  getTrainerPlans: () =>
    api.get('/trainers/my-nutrition').then(r => r.data.plans || []),

  /** Create a new nutrition plan */
  create: (plan) =>
    api.post('/nutrition', plan).then(r => r.data),

  /** Update an existing plan */
  update: (id, plan) =>
    api.put(`/nutrition/${id}`, plan).then(r => r.data),

  /** Delete a plan */
  remove: (id) =>
    api.delete(`/nutrition/${id}`).then(r => r.data),
};

export default nutritionApi;
