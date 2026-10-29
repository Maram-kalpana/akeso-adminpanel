import client from './client';

const settingsApi = {
  get: () => client.get('/settings'),
  update: (payload) => client.put('/settings', payload),
};

export default settingsApi;