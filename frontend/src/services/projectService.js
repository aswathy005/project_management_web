import api from './api';

export const projectService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/projects', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};
