import api from '../api/client';

export const BarbershopService = {
  // ── Clientes ────────────────────────────────────────────────
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
  },

  // ── Barbeiros ────────────────────────────────────────────────
  getMyBarbershops: async () => {
    const response = await api.get('/barbershops/mine');
    return response.data;
  },

  create: async (data: {
    name: string;
    description: string;
    address: string;
    city: string;
    province: string;
    phone: string;
    whatsapp?: string;
    open_hours: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const response = await api.post('/barbershops', data);
    return response.data;
  },

  update: async (id: number, data: Partial<{
    name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    whatsapp: string;
    open_hours: string;
    status: string;
  }>) => {
    const response = await api.put(`/barbershops/${id}`, data);
    return response.data;
  },

  // ── Serviços (CRUD) ──────────────────────────────────────────
  createService: async (barbershopId: number, data: {
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
  }) => {
    const response = await api.post(`/barbershops/${barbershopId}/services`, data);
    return response.data;
  },

  updateService: async (serviceId: number, data: Partial<{
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
  }>) => {
    const response = await api.put(`/barbershops/services/${serviceId}`, data);
    return response.data;
  },

  deleteService: async (serviceId: number) => {
    await api.delete(`/barbershops/services/${serviceId}`);
  },
};
