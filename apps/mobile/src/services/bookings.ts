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
};
