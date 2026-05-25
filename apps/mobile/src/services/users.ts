import api from '../api/client';

export const UserService = {
  setOnline: async (isOnline: boolean) => {
    const response = await api.post('/users/me/online', { is_online: isOnline });
    return response.data;
  }
};
