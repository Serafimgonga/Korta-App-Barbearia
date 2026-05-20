import { create } from 'zustand';
import { BarbershopService } from '../services/barbershops';

export interface Shop {
  id: number;
  name: string;
  city: string;
  province?: string;
  address: string;
  status: 'open' | 'closed' | 'busy';
  average_rating?: number;
  total_reviews?: number;
  is_premium?: boolean;
  phone?: string;
  whatsapp?: string;
  open_hours?: string;
  description?: string;
}

interface BarberState {
  shops: Shop[];
  activeShop: Shop | null;
  loading: boolean;
  initialized: boolean;

  /** Carrega todas as barbearias do barbeiro autenticado */
  loadShops: () => Promise<void>;

  /** Define a barbearia ativa (persiste a sessão de trabalho) */
  setActiveShop: (shop: Shop) => Promise<void>;

  /** Refresca só a lista sem alterar a seleção ativa */
  refreshShops: () => Promise<void>;

  /** Limpa o estado (usado no logout) */
  reset: () => void;
}

export const useBarberStore = create<BarberState>((set, get) => ({
  shops: [],
  activeShop: null,
  loading: false,
  initialized: false,

  loadShops: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await BarbershopService.getMyBarbershops();
      const list: Shop[] = Array.isArray(data) ? data : [];
      const current = get().activeShop;

      // Se já há uma seleção ativa, tenta reencontrá-la na nova lista
      // (pode ter mudado o nome ou estado); caso contrário seleciona a primeira.
      const refreshed = current
        ? list.find((s) => s.id === current.id) ?? list[0] ?? null
        : list[0] ?? null;

      set({ shops: list, activeShop: refreshed, initialized: true });

      // Sincroniza o token de autenticação se houver uma barbearia ativa
      if (refreshed) {
        await get().setActiveShop(refreshed);
      }
    } catch {
      set({ shops: [], initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  setActiveShop: async (shop) => {
    try {
      // Chama o backend para gerar o novo token com a barbearia ativa
      const tokens = await BarbershopService.switchActiveShop(shop.id);
      
      // Atualiza o token na store de autenticação local
      const { useAuthStore } = require('./auth');
      const authState = useAuthStore.getState();
      if (authState.user) {
        await authState.setAuth(authState.user, tokens.access_token);
      }

      set({ activeShop: shop });
    } catch (e) {
      console.error("Falha ao trocar de barbearia", e);
    }
  },

  refreshShops: async () => {
    try {
      const data = await BarbershopService.getMyBarbershops();
      const list: Shop[] = Array.isArray(data) ? data : [];
      const current = get().activeShop;
      const refreshed = current
        ? list.find((s) => s.id === current.id) ?? list[0] ?? null
        : list[0] ?? null;
      set({ shops: list, activeShop: refreshed });
      if (refreshed) {
        await get().setActiveShop(refreshed);
      }
    } catch {}
  },

  reset: () => {
    set({ shops: [], activeShop: null, loading: false, initialized: false });
  },
}));
