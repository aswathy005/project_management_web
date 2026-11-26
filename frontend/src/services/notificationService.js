import api from './api';

export const notificationService = {
  getAll: async (params = {}) => {
    const { data } = await api.get('/notifications', { params });
    return data;
  },
  markRead: async (id) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },
  markAllRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  },
};
