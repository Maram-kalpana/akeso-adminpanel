import api from './client';

const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

export default dashboardApi;
