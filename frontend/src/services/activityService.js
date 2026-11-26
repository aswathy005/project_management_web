import api from './api';

export const activityService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/activities', { params });
    return data;
  },
};
