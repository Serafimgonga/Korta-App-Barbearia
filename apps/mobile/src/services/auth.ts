import api from '../api/client';
import { useAuthStore } from '../store/auth';

export const AuthService = {
  login: async (email: string, password: string) => {
    console.log(`🌐 [KORTA-AuthService] A enviar POST /auth/login para email: ${email}`);
    const response = await api.post('/auth/login', { email, password });
    console.log(`📥 [KORTA-AuthService] Token obtido com sucesso!`);
    const { access_token, user } = response.data;
    
    // O backend atual retorna TokenResponse (access, refresh). 
    // Vou assumir que o user virá no futuro ou faremos um GET /me logo a seguir.
    // Para já, usaremos os dados do TokenResponse.
    
    const setAuth = useAuthStore.getState().setAuth;
    
    console.log(`🌐 [KORTA-AuthService] A carregar dados do utilizador com GET /users/me`);
    const userResponse = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    console.log(`👤 [KORTA-AuthService] Dados do perfil carregados:`, userResponse.data);
    
    await setAuth(userResponse.data, access_token);
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const logoutStore = useAuthStore.getState().logout;
    await logoutStore();
  }
};
