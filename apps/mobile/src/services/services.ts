import api from '../api/client';

export interface ServicePhoto {
  id: number;
  service_id: number;
  shop_id: number;
  url: string;
  caption?: string;
  display_order: number;
  uploaded_by?: number;
  created_at: string;
}

export interface ServiceDetails {
  id: number;
  barbershop_id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  photos: ServicePhoto[];
}

export const ServicesService = {
  getDetails: async (serviceId: number): Promise<ServiceDetails> => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  addPhoto: async (serviceId: number, data: { url: string; shop_id: number; caption?: string; display_order?: number }) => {
    const response = await api.post(`/services/${serviceId}/photos`, data);
    return response.data;
  },

  uploadPhotoFile: async (serviceId: number, fileUri: string, mimeType: string, fileName: string) => {
    const formData = new FormData();
    const { Platform } = require('react-native');

    if (Platform.OS === 'web') {
      try {
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('file', blob, fileName);
      } catch (err) {
        console.error('Error fetching blob for web upload:', err);
        formData.append('file', {
          uri: fileUri,
          type: mimeType,
          name: fileName,
        } as any);
      }
    } else {
      formData.append('file', {
        uri: fileUri,
        type: mimeType,
        name: fileName,
      } as any);
    }

    const response = await api.post(`/services/${serviceId}/photos/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePhoto: async (serviceId: number, photoId: number) => {
    await api.delete(`/services/${serviceId}/photos/${photoId}`);
  }
};
