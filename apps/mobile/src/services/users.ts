import api from '../api/client';

export const UserService = {
  setOnline: async (isOnline: boolean) => {
    const response = await api.post('/users/me/online', { is_online: isOnline });
    return response.data;
  },
  getBarberProfile: async () => {
    const response = await api.get('/users/me/barber-profile');
    const profile = response.data;
    if (profile && profile.barber_type === 'freelancer') {
      profile.barber_type = 'mobile_freelancer';
    }
    return profile;
  },
  updateBarberProfile: async (data: {
    barber_type?: string;
    coverage_radius_km?: number;
    home_service_fee?: number;
    specialties?: string;
    years_experience?: number;
    portfolio_photos?: string;
    bio?: string;
    is_available?: boolean;
    current_lat?: number;
    current_lng?: number;
    onboarding_completed?: boolean;
  }) => {
    const payload = { ...data };
    if (payload.barber_type === 'mobile_freelancer') {
      payload.barber_type = 'freelancer';
    }
    const response = await api.put('/users/me/barber-profile', payload);
    const profile = response.data;
    if (profile && profile.barber_type === 'freelancer') {
      profile.barber_type = 'mobile_freelancer';
    }
    return profile;
  }
};
