import api from './api';

export const taskService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/tasks', { params });
    return data;
  },
  getMyTasks: async (params = {}) => {
    const { data } = await api.get('/tasks/my-tasks', { params });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/tasks/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/tasks', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/tasks/${id}`, payload);
    return data;
  },
  updateStatus: async (id, status, order) => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status, order });
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
  addComment: async (taskId, content) => {
    const { data } = await api.post(`/comments/task/${taskId}`, { content });
    return data;
  },
  deleteComment: async (commentId) => {
    const { data } = await api.delete(`/comments/${commentId}`);
    return data;
  },
};
