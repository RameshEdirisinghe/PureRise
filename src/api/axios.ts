import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,         // always send HTTP-only cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Response interceptor: auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // 401 and not already retrying and not a refresh call itself
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue concurrent requests until refresh completes
        return new Promise<void>((resolve) => {
          refreshQueue.push(resolve);
        }).then(() => api(original));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return api(original);
      } catch {
        refreshQueue = [];
        // Refresh failed — let caller handle it (AuthContext will clear user)
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
