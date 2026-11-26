import api from './api';

export const userService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/users', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/users', payload);
    return data;
  },
  updateRole: async (id, payload) => {
    const { data } = await api.patch(`/users/${id}/role`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
