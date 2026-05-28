import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { ChevronLeft, Sparkles, Star, Check, Zap, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

import api from '../../src/api/client';

export default function SelectBarber() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lat, lng, serviceId, serviceName, price, mode, deliveryFee } = params as any;

  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'salon_owner' | 'freelancer' | 'hybrid'>('all');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Carregar barbearias próximas da API
    const fetchBarbers = async () => {
      try {
        setLoading(true);
        setError(null);
        const params: any = { radius_km: 50 };
        if (lat) params.lat = parseFloat(String(lat));
        if (lng) params.lng = parseFloat(String(lng));
        const res = await api.get('/barbershops/nearby', { params });
        const shops: any[] = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
        const mapped = shops.map((shop: any) => ({
          id: String(shop.id),
          name: shop.name,
          rating: shop.average_rating ?? 0,
          completed: shop.total_reviews ?? 0,
          avatar: '✂️',
          shopId: shop.id,
          barberType: shop.barber_type || 'salon_owner',
          isAvailable: !!shop.is_available,
        }));
        setBarbers(mapped);
      } catch (e: any) {
        setError('Não foi possível carregar os barbeiros. Tenta novamente.');
      } finally {
        setLoading(false);
      }
    };
    fetchBarbers();
  }, []);

  // Filtrar conforme o tipo e o modo de reserva (salão ou domicílio)
  const filteredBarbers = barbers.filter((barber) => {
    // 1. Filtrar pelo modo da reserva
    if (mode === 'home') {
      // Domicílio: só quem se desloca (freelancer ou hybrid)
      if (barber.barberType !== 'freelancer' && barber.barberType !== 'hybrid') {
        return false;
      }
    } else {
      // Salão: só quem tem espaço físico (salon_owner ou hybrid)
      if (barber.barberType !== 'salon_owner' && barber.barberType !== 'hybrid') {
        return false;
      }
    }

    // 2. Filtrar pela aba selecionada
    if (filterType !== 'all' && barber.barberType !== filterType) {
      return false;
    }

    return true;
  });

  const handleSelectAuto = () => {
    setSelectedBarber({
      id: 'auto',
      name: 'Deixar o sistema escolher',
      rating: 4.9,
      isAuto: true
    });
  };

  const handleNext = () => {
    if (!selectedBarber) return;
    
    router.push({
      pathname: '/booking/confirm',
      params: {
        lat,
        lng,
        serviceId,
        serviceName,
        price,
        mode,
        deliveryFee,
        barberId: selectedBarber.id,
        barberName: selectedBarber.isAuto ? 'Barbeiro Automático' : selectedBarber.name,
        barberRating: String(selectedBarber.rating)
      }
    });
  };

  return (
    <LinearGradient
      colors={['#000000', '#18181b']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#f59e0b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pedir Corte</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={styles.badge}>
                <Sparkles size={12} color="#f59e0b" />
                <Text style={styles.badgeText}>PASSO 3 DE 8</Text>
              </View>
              <Text style={styles.title}>Quem fará o teu corte?</Text>
              <Text style={styles.subtitle}>Escolhe o teu barbeiro preferido ou usa a escolha automática para maior rapidez.</Text>
            </View>

            {/* Auto System Selection Card */}
            <TouchableOpacity
              style={[
                styles.autoCard,
                selectedBarber?.id === 'auto' && styles.autoCardSelected,
                Shadows.elegant
              ]}
              activeOpacity={0.9}
              onPress={handleSelectAuto}
            >
              <View style={styles.autoHeader}>
                <View style={styles.autoIconContainer}>
                  <Zap size={24} color="#000" strokeWidth={2.5} />
                </View>
                <View style={styles.autoBadge}>
                  <Text style={styles.autoBadgeText}>Mais Recomendado</Text>
                </View>
              </View>

              <View style={styles.autoBody}>
                <Text style={styles.autoTitle}>Deixar o sistema escolher</Text>
                <Text style={styles.autoDesc}>O algoritmo vai selecionar instantaneamente o barbeiro ativo melhor classificado mais próximo de ti.</Text>
              </View>

              {selectedBarber?.id === 'auto' && (
                <View style={styles.checkIndicator}>
                  <Check size={12} color="#000" strokeWidth={3} />
                </View>
              )}
            </TouchableOpacity>

            {/* List Divider */}
            <Text style={styles.sectionLabel}>Ou escolhe um profissional</Text>

            {/* Filter Tabs */}
            <View style={styles.filterTabsContainer}>
              {[
                { type: 'all', label: 'Todos' },
                { type: 'salon_owner', label: 'No Salão' },
                { type: 'freelancer', label: 'Ao Domicílio' },
                { type: 'hybrid', label: 'Híbrido' }
              ].map((tab) => {
                const isActive = filterType === tab.type;
                return (
                  <TouchableOpacity
                    key={tab.type}
                    style={[
                      styles.filterTabButton,
                      isActive && styles.filterTabButtonActive
                    ]}
                    onPress={() => setFilterType(tab.type as any)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        isActive && styles.filterTabTextActive
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Barbers List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text style={styles.loadingText}>A carregar profissionais…</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : filteredBarbers.length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Nenhum profissional disponível com estes filtros.</Text>
              </View>
            ) : (
              <View style={styles.barbersList}>
                {filteredBarbers.map((barber) => {
                  const isSelected = selectedBarber?.id === barber.id;
                  return (
                    <TouchableOpacity
                      key={barber.id}
                      style={[
                        styles.barberCard,
                        isSelected && styles.barberCardSelected
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setSelectedBarber(barber)}
                    >
                      <View style={styles.barberAvatarContainer}>
                        <Text style={styles.barberAvatar}>{barber.avatar}</Text>
                      </View>

                      <View style={styles.barberInfo}>
                        <View style={styles.nameRow}>
                          <Text style={styles.barberName}>{barber.name}</Text>
                          <View style={[
                            styles.typeBadge,
                            barber.barberType === 'freelancer' && styles.typeBadgeFreelancer,
                            barber.barberType === 'hybrid' && styles.typeBadgeHybrid,
                            barber.barberType === 'salon_owner' && styles.typeBadgeSalon,
                          ]}>
                            <Text style={[
                              styles.typeBadgeText,
                              barber.barberType === 'freelancer' && { color: '#fca5a5' },
                              barber.barberType === 'hybrid' && { color: '#fcd34d' },
                              barber.barberType === 'salon_owner' && { color: '#93c5fd' },
                            ]}>
                              {barber.barberType === 'freelancer' ? 'Ao Domicílio' :
                               barber.barberType === 'hybrid' ? 'Híbrido' : 'No Salão'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.barberMeta}>
                          <View style={styles.ratingContainer}>
                            <Star size={12} color="#f59e0b" fill="#f59e0b" />
                            <Text style={styles.ratingText}>{Number(barber.rating).toFixed(1)}</Text>
                          </View>
                          <Text style={styles.metaDivider}>•</Text>
                          <Text style={styles.metaText}>{barber.completed} avaliações</Text>
                          <Text style={styles.metaDivider}>•</Text>
                          <View style={[styles.statusIndicator, barber.isAvailable ? styles.statusOnline : styles.statusOffline]} />
                          <Text style={styles.metaText}>{barber.isAvailable ? 'Online' : 'Offline'}</Text>
                        </View>
                      </View>

                      {isSelected ? (
                        <View style={styles.checkIndicatorList}>
                          <Check size={12} color="#000" strokeWidth={3} />
                        </View>
                      ) : (
                        <View style={styles.circleIndicator} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                !selectedBarber && styles.actionButtonDisabled,
                selectedBarber && Shadows.gold
              ]}
              onPress={handleNext}
              disabled={!selectedBarber}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>Rever Resumo do Pedido</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  titleSection: {
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    lineHeight: 20,
    fontWeight: '500',
  },
  autoCard: {
    backgroundColor: '#1e1b4b', // Indigo-950/deep purple-blue tone for glow look
    borderWidth: 2.5,
    borderColor: '#312e81',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  autoCardSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#27272a',
  },
  autoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  autoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fbbf24',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  autoBody: {
    gap: 6,
  },
  autoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  autoDesc: {
    fontSize: 12,
    color: '#c7d2fe', // light blue-zinc
    lineHeight: 18,
  },
  checkIndicator: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  barbersList: {
    gap: Spacing.md,
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#27272A',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 14,
  },
  barberCardSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#27272a',
  },
  barberAvatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  barberAvatar: {
    fontSize: 24,
  },
  barberInfo: {
    flex: 1,
    gap: 4,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  barberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaDivider: {
    color: '#71717a',
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#a1a1aa',
  },
  checkIndicatorList: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3f3f46',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#000000',
  },
  actionButton: {
    backgroundColor: '#f59e0b',
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.35,
    backgroundColor: '#27272A',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#18181b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: Radius.full,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  filterTabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  filterTabButtonActive: {
    backgroundColor: '#f59e0b',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  filterTabTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: '#27272A',
  },
  typeBadgeFreelancer: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  typeBadgeHybrid: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  typeBadgeSalon: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusOnline: {
    backgroundColor: '#10b981',
  },
  statusOffline: {
    backgroundColor: '#ef4444',
  },
});
