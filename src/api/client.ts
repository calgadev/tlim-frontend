import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const AUTH_KEYS = ['token', 'username', 'role'] as const;

// Token is read at call time so logout immediately stops token attachment.
// sessionStorage is checked second to support the "remember me unchecked" case.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthEndpoint = err.config?.url?.startsWith('/api/auth/');
    if (err.response?.status === 401 && !isAuthEndpoint) {
      // Only redirect on 401 from protected endpoints — auth endpoints legitimately
      // return 401 for wrong credentials and must let the form handle the error.
      AUTH_KEYS.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
