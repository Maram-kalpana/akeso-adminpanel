import client from './client';

const partnersApi = {
  list: (params) => client.get('/partners', { params }),
  get: (id) => client.get(`/partners/${id}`),
  create: (payload) => client.post('/partners', payload),
  update: (id, payload) => client.put(`/partners/${id}`, payload),
  remove: (id) => client.delete(`/partners/${id}`),
};

export default partnersApi;