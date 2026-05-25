import api from '../api/client';

// Tipos de marcação
export interface BookingCreatePayload {
  barbershop_id: number;
  service_id: number;
  date: string;       // formato: YYYY-MM-DD
  time_slot: string;  // formato: HH:MM
  notes?: string;
}

export interface BookingStatusPayload {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export const BookingService = {
  // Criar nova marcação (detecta conflitos automaticamente)
  create: async (payload: BookingCreatePayload) => {
    const response = await api.post('/bookings', payload);
    return response.data;
  },

  // Marcações do utilizador autenticado
  myBookings: async () => {
    const response = await api.get('/bookings/me');
    return response.data;
  },

  // Marcações da barbearia activa (só o dono, usando a sessão do JWT)
  getActiveShopBookings: async () => {
    const response = await api.get('/bookings');
    return response.data;
  },

  // Marcações de uma barbearia (só o dono)
  barbershopBookings: async (barbershopId: number) => {
    const response = await api.get(`/bookings/barbershop/${barbershopId}`);
    return response.data;
  },

  // Confirmar / Cancelar marcação
  updateStatus: async (bookingId: number, payload: BookingStatusPayload) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, payload);
    return response.data;
  },

  // Obter horários ocupados para uma barbearia em determinada data
  getBusySlots: async (barbershopId: number, date: string): Promise<string[]> => {
    const response = await api.get(`/bookings/busy-slots?barbershop_id=${barbershopId}&date=${date}`);
    return response.data;
  },

  // --- Booking Requests (matchmaking) ---
  createRequest: async (payload: { service_id: number; lat: number; lng: number; radius_km?: number }) => {
    const response = await api.post('/bookings/request', payload);
    return response.data;
  },

  getRequest: async (requestId: number) => {
    const response = await api.get(`/bookings/request/${requestId}`);
    return response.data;
  },

  listPendingRequests: async (lat: number, lng: number, radius_km = 10, service_id?: number) => {
    const q = new URLSearchParams({ lat: String(lat), lng: String(lng), radius_km: String(radius_km) });
    if (service_id) q.append('service_id', String(service_id));
    const response = await api.get(`/bookings/requests/pending?${q.toString()}`);
    return response.data;
  }
};
