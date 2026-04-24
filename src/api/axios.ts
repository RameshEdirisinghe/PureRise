import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,         // always send HTTP-only cookies with every request
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Token Refresh Queue: handle concurrent requests during token refresh ──────
let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

/**
 * Process queued requests after token refresh completes
 */
const processQueue = (): void => {
  refreshQueue.forEach((callback) => callback());
  refreshQueue = [];
};

// ── Response Interceptor: Auto-refresh access token on 401 ────────────────────
/**
 * Industry-standard token refresh flow:
 * 1. On 401, attempt to refresh access token using refresh token (stored in HTTP-only cookie)
 * 2. Queue concurrent requests during refresh to prevent duplicate refresh calls
 * 3. Retry original request with new access token
 * 4. If refresh fails, let caller handle (AuthContext clears user state)
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    // Only retry on 401, and only if not already retrying
    if (
      error.response?.status === 401 &&
      !originalConfig._retry &&
      !originalConfig.url?.includes('/auth/refresh') &&
      !originalConfig.url?.includes('/auth/login') &&
      !originalConfig.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        // Token refresh in progress — queue this request
        return new Promise<void>((resolve) => {
          refreshQueue.push(resolve);
        }).then(() => api(originalConfig));
      }

      originalConfig._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh access token using refresh token (sent automatically via HTTP-only cookie)
        await api.post('/auth/refresh');
        processQueue();
        return api(originalConfig);
      } catch (refreshError) {
        // Refresh failed — don't retry. Let the component handle logout
        processQueue();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
