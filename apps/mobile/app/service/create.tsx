// apps/mobile/app/service/create.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius } from '../../src/theme';
import { ServicesService } from '../../src/services/services';
import { BarbershopService } from '../../src/services/barbershops';
import { useBarberStore } from '../../src/store/barber';

export default function ServiceCreate() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeShop } = useBarberStore();
  const [activeTab, setActiveTab] = useState<'details' | 'photos'>('details');

  // ---------- Service form ----------
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');

  // ---------- Photo handling ----------
  const [photos, setPhotos] = useState<any[]>([]); // stored as {uri, name, type}

  const createServiceMutation = useMutation({
    mutationFn: (data: { name: string; description?: string; price: number; duration_minutes: number }) => {
      if (!activeShop) throw new Error('Nenhuma barbearia ativa');
      return BarbershopService.createActiveService({
        name: data.name,
        description: data.description || '',
        price: data.price,
        duration_minutes: data.duration_minutes
      });
    },
    onSuccess: (service: any) => {
      Alert.alert('Serviço criado', `ID: ${service.id}`);
      // Passa o ID para a aba de fotos
      setCreatedServiceId(service.id);
      setActiveTab('photos');
    },
    onError: (err) => {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível criar o serviço');
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: any) => {
      if (!createdServiceId) return;
      return ServicesService.uploadPhotoFile(
        createdServiceId,
        file.uri,
        file.type || 'image/jpeg',
        file.fileName || `photo_${Date.now()}.jpg`
      );
    },
    onSuccess: () => {
      Alert.alert('Sucesso', 'Foto enviada');
      // opcional: refetch fotos do serviço
    },
    onError: (err) => {
      console.error(err);
      Alert.alert('Erro', 'Falha ao enviar foto');
    },
  });

  // armazenar ID do serviço criado para uso futuro
  const [createdServiceId, setCreatedServiceId] = useState<number | null>(null);

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'A aplicação precisa de acesso à galeria');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos([...photos, result.assets[0]]);
    }
  };

  const handleUploadAll = async () => {
    for (const p of photos) {
      await uploadPhotoMutation.mutateAsync(p);
    }
    setPhotos([]);
  };

  const submitService = () => {
    if (!name || !price) {
      Alert.alert('Erro', 'Preencha nome e preço');
      return;
    }
    createServiceMutation.mutate({
      name,
      description: description || undefined,
      price: Number(price),
      duration_minutes: Number(duration),
    });
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'details' && styles.tabItemActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>Dados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>Fotos</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'details' && (
          <View style={styles.section}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nome do serviço" />
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, {height: 80}]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descrição"
              multiline
            />
            <Text style={styles.label}>Preço (AOA)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Preço"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Duração (min)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={submitService}>
              <Text style={styles.saveBtnText}>Criar serviço</Text>
            </TouchableOpacity>
          </View>
        )}
        {activeTab === 'photos' && (
          <View style={styles.section}>
            {createdServiceId ? (
              <>
                <TouchableOpacity style={styles.pickBtn} onPress={handlePickImage}>
                  <Text style={styles.pickBtnText}>Escolher imagem</Text>
                </TouchableOpacity>
                <View style={styles.photoPreviewContainer}>
                  {photos.map((p, i) => (
                    <Image key={i} source={{ uri: p.uri }} style={styles.previewImg} />
                  ))}
                </View>
                {photos.length > 0 && (
                  <TouchableOpacity style={styles.uploadAllBtn} onPress={handleUploadAll}>
                    <Text style={styles.uploadAllText}>Carregar todas ({photos.length})</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <Text style={styles.info}>Crie o serviço primeiro (aba Dados).</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  tabItem: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.mutedForeground },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  scrollContent: { padding: Spacing.md },
  section: { marginTop: Spacing.lg },
  label: { fontSize: 13, color: Colors.mutedForeground, marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: Colors.border, borderRadius: Radius.sm, padding: Spacing.xs, marginBottom: Spacing.md },
  saveBtn: { backgroundColor: Colors.primary, padding: Spacing.sm, borderRadius: Radius.sm, alignItems: 'center' },
  saveBtnText: { color: Colors.primaryForeground, fontWeight: '800' },
  pickBtn: { backgroundColor: Colors.surface, padding: Spacing.sm, borderRadius: Radius.sm, alignItems: 'center', marginBottom: Spacing.md },
  pickBtnText: { color: Colors.foreground },
  photoPreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewImg: { width: 80, height: 80, borderRadius: Radius.sm },
  uploadAllBtn: { backgroundColor: Colors.primary, padding: Spacing.sm, borderRadius: Radius.sm, alignItems: 'center', marginTop: Spacing.md },
  uploadAllText: { color: Colors.primaryForeground },
  info: { color: Colors.mutedForeground, fontStyle: 'italic' },
});
