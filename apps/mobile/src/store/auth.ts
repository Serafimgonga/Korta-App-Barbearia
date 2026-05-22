import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'barber' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Utilitário para persistência multiplataforma (iOS/Android/Web)
const storage = {
  getItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.error("Erro ao salvar no storage", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.error("Erro ao remover do storage", e);
    }
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  initialized: false,

  setAuth: async (user, token) => {
    await storage.setItem('auth_token', token);
    await storage.setItem('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, initialized: true });
  },

  logout: async () => {
    await storage.removeItem('auth_token');
    await storage.removeItem('user_data');
    set({ user: null, token: null, isAuthenticated: false, initialized: true });
  },

  initialize: async () => {
    const token = await storage.getItem('auth_token');
    const userData = await storage.getItem('user_data');
    
    if (token && userData) {
      try {
        set({ 
          token, 
          user: JSON.parse(userData), 
          isAuthenticated: true 
        });
      } catch {
        // Dados corrompidos
        await storage.removeItem('auth_token');
        await storage.removeItem('user_data');
      }
    }
    set({ initialized: true });
  },
}));
