import api from '../api/client';

export const BarbershopService = {
  listAll: async (params?: any) => {
    const response = await api.get('/barbershops', { params });
    return response.data;
  },

  getNearby: async (lat: number, lng: number, radius = 10) => {
    const response = await api.get('/barbershops/nearby', {
      params: { lat, lng, radius_km: radius }
    });
    return response.data;
  },

  getDetails: async (id: number) => {
    const response = await api.get(`/barbershops/${id}`);
    return response.data;
  },

  getServices: async (barbershopId: number) => {
    const response = await api.get(`/barbershops/${barbershopId}/services`);
    return response.data;
  }
};
