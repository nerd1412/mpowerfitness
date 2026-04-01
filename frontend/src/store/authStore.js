import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, role, accessToken, refreshToken) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        set({ user, role, accessToken, refreshToken, isAuthenticated: true, error: null });
      },

      updateUser: (updates) => set(state => ({ user: { ...state.user, ...updates } })),

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, role: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false, error: null });
      },

      loginUser: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/user/login', { email, password });
          get().setAuth(data.user, 'user', data.accessToken, data.refreshToken);
          return { success: true, user: data.user };
        } catch (err) {
          const error = err.response?.data?.message || 'Login failed';
          set({ error, isLoading: false });
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      loginTrainer: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/trainer/login', { email, password });
          if (!data.user) throw new Error('Invalid response from server');
          get().setAuth(data.user, 'trainer', data.accessToken, data.refreshToken);
          return { success: true, user: data.user };
        } catch (err) {
          const error = err.response?.data?.message || err.message || 'Login failed';
          const code  = err.response?.data?.code;
          set({ error, isLoading: false });
          return { success: false, error, code };
        } finally {
          set({ isLoading: false });
        }
      },

      loginAdmin: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/admin/login', { email, password });
          get().setAuth(data.user, data.user.role, data.accessToken, data.refreshToken);
          return { success: true, user: data.user };
        } catch (err) {
          const error = err.response?.data?.message || 'Login failed';
          set({ error, isLoading: false });
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      registerUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/user/register', userData);
          get().setAuth(data.user, 'user', data.accessToken, data.refreshToken);
          return { success: true, user: data.user };
        } catch (err) {
          const error = err.response?.data?.message || 'Registration failed';
          set({ error, isLoading: false });
          return { success: false, error };
        } finally {
          set({ isLoading: false });
        }
      },

      registerTrainer: async (trainerData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/trainer/register', trainerData);
          set({ isLoading: false });
          return { success: true, data };
        } catch (err) {
          const error = err.response?.data?.message || 'Registration failed';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      },

      completeOnboarding: async (onboardingData) => {
        try {
          const { data } = await api.post('/auth/user/onboarding', onboardingData);
          set(state => ({ user: { ...state.user, onboardingCompleted: true, ...onboardingData } }));
          return { success: true };
        } catch (err) {
          return { success: false, error: err.response?.data?.message };
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'mpower-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
