import axios from 'axios';
import { clearStoredAuth, readStoredToken } from '@/lib/authStorage';

// In development VITE_API_BASE_URL is left unset: requests go to /api on the Vite dev server,
// which proxies them to the backend (see vite.config.ts), so no CORS is involved.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '',
});

// Token is read at call time, so a logout immediately stops it being attached.
client.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // Auth endpoints legitimately return 401 for wrong credentials; let the form handle those.
    const isAuthEndpoint = err.config?.url?.startsWith('/api/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      // Expired or invalid token: drop the whole session and start over at the login page.
      clearStoredAuth();
      window.location.assign('/login?expired=1');
    }
    return Promise.reject(err);
  }
);

export default client;
