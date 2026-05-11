import api from '../api/client';

// Tipos de avaliação
export interface ReviewCreatePayload {
  barbershop_id: number;
  rating: number;    // 1 a 5
  comment?: string;
}

export const ReviewService = {
  // Listar avaliações de uma barbearia
  listByBarbershop: async (barbershopId: number, page = 1, perPage = 20) => {
    const response = await api.get(`/reviews/barbershop/${barbershopId}`, {
      params: { page, per_page: perPage }
    });
    return response.data;
  },

  // Criar avaliação (utilizador autenticado, apenas 1 por barbearia)
  create: async (payload: ReviewCreatePayload) => {
    const response = await api.post('/reviews', payload);
    return response.data;
  },
};
