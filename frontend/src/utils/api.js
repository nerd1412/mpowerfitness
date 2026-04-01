import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('mpower-auth');
    if (raw) {
      const { state } = JSON.parse(raw);
      if (state?.accessToken) config.headers['Authorization'] = `Bearer ${state.accessToken}`;
    }
  } catch {}
  return config;
});

// Auto-refresh on 401 TOKEN_EXPIRED
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const { default: useAuthStore } = await import('../store/authStore');
        const ok = await useAuthStore.getState().refreshAccessToken();
        if (ok) {
          const raw = localStorage.getItem('mpower-auth');
          if (raw) {
            const { state } = JSON.parse(raw);
            if (state?.accessToken) original.headers['Authorization'] = `Bearer ${state.accessToken}`;
          }
          return api(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
