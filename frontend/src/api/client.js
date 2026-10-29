import axios from 'axios';

const api = axios.create({
  // baseURL: '/api',
   baseURL:
    import.meta.env.VITE_API_URL ||
    "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hospital_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hospital_admin_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function toFormData(values, fileField, file) {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      fd.append(key, JSON.stringify(value));
    } else if (typeof value === 'boolean') {
      fd.append(key, value ? 'true' : 'false');
    } else {
      fd.append(key, value);
    }
  });
  if (file && fileField) {
    fd.append(fileField, file);
  }
  return fd;
}

export default api;
