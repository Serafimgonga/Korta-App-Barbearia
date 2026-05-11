import axios from 'axios';
import { useAuthStore } from '../store/auth';

/*
 * CONFIGURAÇÃO DA URL DA API
 * ─────────────────────────────────────────────────────
 * Para testar com Expo Go num dispositivo físico:
 *
 *   1. Inicia o tunnel da API:  ./tunnel.sh   (na pasta /apps/api)
 *   2. Copia a URL ngrok gerada (ex: https://abc123.ngrok-free.app)
 *   3. Substitui a variável NGROK_URL abaixo e guarda o ficheiro
 *   4. O Expo recarrega automaticamente
 *
 * Para emulador Android:        http://10.0.2.2:8000/api/v1
 * Para emulador iOS (simulator): http://localhost:8000/api/v1
 * ─────────────────────────────────────────────────────
 */
const NGROK_URL = ''; // ← Cola aqui a URL do ngrok quando disponível

const getBaseURL = () => {
  // Se tiver URL do ngrok configurada, usar sempre (dispositivo físico)
  if (NGROK_URL) return `${NGROK_URL}/api/v1`;

  // Emulador Android
  return 'http://10.0.2.2:8000/api/v1';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de REQUISIÇÃO — injeta o token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPOSTA — trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado — faz logout automático
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
