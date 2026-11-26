import api from './api';

export const authService = {
  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post('/auth/login', payload);
    return data;
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
  updateProfile: async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
  changePassword: async (payload) => {
    const { data } = await api.put('/auth/password', payload);
    return data;
  },
};
