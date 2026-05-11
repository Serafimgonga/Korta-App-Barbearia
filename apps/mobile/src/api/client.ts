import axios from 'axios';
import { Platform } from 'react-native';

// No Android Emulator, 10.0.2.2 mapeia para o localhost da máquina host
const BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000/api/v1' 
  : 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação em cada requisição
api.interceptors.request.use(async (config) => {
  // Aqui buscaremos o token do storage futuramente
  // const token = await storage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export default api;
