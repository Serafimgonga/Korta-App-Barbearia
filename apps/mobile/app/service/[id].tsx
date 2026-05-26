import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../src/theme';
import { ServicesService } from '../../src/services/services';
import { BarbershopService } from '../../src/services/barbershops';
import { useAuthStore } from '../../src/store/auth';
import { ArrowLeft, Star, Clock, Camera, ChevronRight, MessageSquare, Plus } from 'lucide-react-native';

export default function ServiceDetails() {
  const { id, shopName } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'photos' | 'reviews'>('photos');

  // Obter detalhes completos do serviço
  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => ServicesService.getDetails(Number(id)),
  });

  // Mutação para adicionar nova foto
  const addPhotoMutation = useMutation({
    mutationFn: (data: { url: string; shop_id: number; caption?: string; display_order?: number }) =>
      ServicesService.addPhoto(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      Alert.alert('Sucesso', 'Foto adicionada à galeria com sucesso!');
    },
    onError: (error) => {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível carregar a foto do serviço.');
    },
  });

  // Simular upload de foto (escolhe uma foto de portfólio premium aleatória e adiciona ao backend)
  const handleAddPhotoSimulated = () => {
    if (!service) return;

    const mockHaircuts = [
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800',
      'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800',
    ];

    const randomUrl = mockHaircuts[Math.floor(Math.random() * mockHaircuts.length)];

    Alert.alert(
      'Adicionar Trabalho Realizado',
      'Desejas adicionar um novo corte realizado à galeria deste serviço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: () => {
            addPhotoMutation.mutate({
              url: randomUrl,
              shop_id: service.barbershop_id,
              caption: `Novo trabalho de ${service.name}`,
              display_order: service.photos.length,
            });
          },
        },
      ]
    );
  };

  const handleBookNow = () => {
    if (!service) return;

    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (!isAuthenticated) {
      Alert.alert(
        "💈 Entra na tua Conta!",
        "Para agendares este serviço, precisas de ter sessão iniciada. Queres fazer login ou registar?",
        [
          { text: "Entrar / Registar", onPress: () => router.push('/(auth)/login') },
          { text: "Continuar a navegar", style: "cancel" }
        ]
      );
      return;
    }

    router.push({
      pathname: '/booking/create',
      params: {
        barbershopId: service.barbershop_id,
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const photos = service?.photos || [];
  const totalPhotosCount = photos.length;
  const displayPhotos = photos.slice(0, 4); // Mostra no máximo 4 na grelha inicial

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.topbarTitleContainer}>
          <Text style={styles.topbarTitle} numberOfLines={1}>{service?.name}</Text>
          <Text style={styles.topbarSub}>{shopName || 'Barbearia Premium'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service Header Info */}
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Text style={styles.serviceIcon}>✂️</Text>
          </View>
          <View style={styles.serviceHeaderInfo}>
            <Text style={styles.serviceName}>{service?.name}</Text>
            <View style={styles.serviceMetaRow}>
              <View style={styles.metaItem}>
                <Clock size={12} color={Colors.mutedForeground} />
                <Text style={styles.metaText}>{service?.duration_minutes} min</Text>
              </View>
              <Text style={styles.metaDot}>·</Text>
              <View style={styles.metaItem}>
                <Star size={12} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.metaText}>4.8 (32 avaliações)</Text>
              </View>
            </View>
          </View>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>
              {service?.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'details' && styles.tabItemActive]}
            onPress={() => setActiveTab('details')}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>Detalhes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'photos' && styles.tabItemActive]}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
              Fotos ({totalPhotosCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reviews' && styles.tabItemActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>Avaliações</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Tab Content */}
        {activeTab === 'details' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.sectionLabel}>SOBRE O SERVIÇO</Text>
            <View style={styles.detailsCard}>
              <Text style={styles.detailsText}>
                {service?.description ||
                  'Desfruta de uma experiência de corte premium com os nossos barbeiros experientes. Inclui aconselhamento de estilo personalizado, lavagem e finalização com os melhores produtos.'}
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'photos' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.sectionLabel}>TRABALHOS REALIZADOS</Text>

            {totalPhotosCount === 0 ? (
              <View style={styles.emptyGalleryCard}>
                <Camera size={32} color={Colors.mutedForeground} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyGalleryText}>Nenhuma foto adicionada a este serviço ainda.</Text>
              </View>
            ) : (
              <View style={styles.photoGrid}>
                {displayPhotos.map((photo, index) => {
                  const isFirst = index === 0;
                  const isLast = index === 3 && totalPhotosCount > 4;

                  return (
                    <TouchableOpacity
                      key={photo.id}
                      style={[styles.photoThumb, isFirst && styles.photoThumbFeatured]}
                      activeOpacity={0.9}
                    >
                      <Image source={{ uri: photo.url }} style={styles.photoImage} />
                      {isFirst && (
                        <View style={styles.photoCountBadge}>
                          <Text style={styles.photoCountBadgeText}>1 / {totalPhotosCount}</Text>
                        </View>
                      )}
                      {isLast && (
                        <View style={styles.photoOverlay}>
                          <Text style={styles.photoOverlayText}>+{totalPhotosCount - 4} fotos</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Adicionar nova foto (Row) */}
            <TouchableOpacity style={styles.addPhotoRow} onPress={handleAddPhotoSimulated} activeOpacity={0.8}>
              <View style={styles.addIconContainer}>
                <Camera size={16} color={Colors.mutedForeground} />
              </View>
              <View style={styles.addPhotoTextContainer}>
                <Text style={styles.addPhotoTitle}>Adicionar foto deste serviço</Text>
                <Text style={styles.addPhotoSub}>JPG ou PNG · máx. 10 MB</Text>
              </View>
              <ChevronRight size={16} color={Colors.mutedForeground} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContentSection}>
            <Text style={styles.sectionLabel}>AVALIAÇÕES RECENTES</Text>
            <View style={styles.reviewsList}>
              {[
                { id: 1, name: 'Abel Ferreira', rating: 5, date: 'Ontem', comment: 'Corte super limpo, barbeiro muito atencioso e simpático!' },
                { id: 2, name: 'David Neto', rating: 4, date: 'Há 3 dias', comment: 'Muito boa finalização. O degradê ficou incrível.' },
                { id: 3, name: 'Emanuel Costa', rating: 5, date: 'Há 1 semana', comment: 'Trabalho de barba perfeito com toalha quente.' },
              ].map((rev) => (
                <View key={rev.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{rev.name}</Text>
                    <Text style={styles.reviewDate}>{rev.date}</Text>
                  </View>
                  <View style={styles.reviewStarsRow}>
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={10} color={Colors.primary} fill={Colors.primary} style={{ marginRight: 2 }} />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>{rev.comment}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Bottom Bar */}
      <View style={styles.bookBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.bookPrice}>
            {service?.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.bookPriceSub}>por sessão</Text>
        </View>
        <TouchableOpacity style={styles.bookBtn} onPress={handleBookNow} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Marcar agora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  topbarTitleContainer: {
    flex: 1,
  },
  topbarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.foreground,
    letterSpacing: -0.2,
  },
  topbarSub: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  serviceHeader: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  serviceIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceHeaderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.foreground,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  metaDot: {
    color: Colors.mutedForeground,
    marginHorizontal: 6,
    fontSize: 12,
  },
  serviceBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  serviceBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    color: Colors.mutedForeground,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  tabContentSection: {
    padding: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  detailsCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  detailsText: {
    fontSize: 14,
    color: Colors.mutedForeground,
    lineHeight: 22,
  },
  emptyGalleryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGalleryText: {
    fontSize: 13,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  photoThumb: {
    width: '49%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbFeatured: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  photoCountBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOverlayText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  addPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  addIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addPhotoTextContainer: {
    flex: 1,
  },
  addPhotoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.foreground,
  },
  addPhotoSub: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  reviewStarsRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.mutedForeground,
    lineHeight: 18,
  },
  bookBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingBottom: 28, // Safe area padding
  },
  priceContainer: {
    justifyContent: 'center',
  },
  bookPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookPriceSub: {
    fontSize: 10,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  bookBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    color: Colors.primaryForeground,
    fontSize: 14,
    fontWeight: '800',
  },
});
