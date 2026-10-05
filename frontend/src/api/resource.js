import api from './client';

export default function resourceApi(base) {
  return {
    list: (params) => api.get(base, { params }),
    get: (id) => api.get(`${base}/${id}`),
    create: (data) => api.post(base, data),
    update: (id, data) => api.put(`${base}/${id}`, data),
    remove: (id) => api.delete(`${base}/${id}`),
    options: () => api.get(`${base}/options`),
  };
}
