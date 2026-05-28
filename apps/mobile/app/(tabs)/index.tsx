import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  Animated
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { BarbershopService } from '../../src/services/barbershops';
import { BarbershopCard } from '../../src/components/BarbershopCard';
import {
  Search,
  MapPin,
  Scissors,
  Star,
  Crown,
  Navigation,
  SlidersHorizontal,
  Map as MapIcon,
  List as ListIcon,
  Sparkles,
  ChevronRight,
  Zap,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const CATEGORIES = [
  { id: 'all',     label: 'Todos',        icon: SlidersHorizontal },
  { id: 'premium', label: 'Premium',      icon: Crown },
  { id: 'top',     label: 'Mais Votados', icon: Star },
  { id: 'nearby',  label: 'Perto de Ti',  icon: Navigation },
];

const ONLINE_MAP_BARBERS = [
  {
    id: '1',
    name: 'Serafim Gonga',
    avatar: '👨‍🎨',
    barberType: 'hybrid',
    rating: 4.9,
    reviews: 142,
    matchScore: 98,
    distance: '0.8 km',
    specialties: ['Degradê / Fade', 'Barba Completa', 'Corte Premium'],
    address: 'KORTA Club, Bairro Alvalade',
    isOnline: true,
    coords: { x: '35%', y: '40%' }
  },
  {
    id: '2',
    name: 'Abel Ferreira',
    avatar: '💈',
    barberType: 'freelancer',
    rating: 4.8,
    reviews: 98,
    matchScore: 95,
    distance: '2.4 km',
    specialties: ['Corte Clássico', 'Giletado Luanda', 'Pigmentação'],
    address: 'Atendimento ao Domicílio',
    isOnline: true,
    coords: { x: '65%', y: '28%' }
  },
  {
    id: '3',
    name: 'Kuyuyu de Angola',
    avatar: '⚡',
    barberType: 'hybrid',
    rating: 4.7,
    reviews: 64,
    matchScore: 92,
    distance: '3.1 km',
    specialties: ['Risco & Desenho', 'Escova Progressiva', 'Barba VIP'],
    address: 'KORTA Central, Talatona',
    isOnline: true,
    coords: { x: '45%', y: '68%' }
  },
  {
    id: '4',
    name: 'Barbosa Styles',
    avatar: '✂️',
    barberType: 'salon_owner',
    rating: 4.6,
    reviews: 82,
    matchScore: 89,
    distance: '1.5 km',
    specialties: ['Corte Americano', 'Tratamento Capilar'],
    address: 'Salão Noblesse, Maianga',
    isOnline: true,
    coords: { x: '20%', y: '58%' }
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapBarber, setSelectedMapBarber] = useState<typeof ONLINE_MAP_BARBERS[0] | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleQuickRequest = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "💈 Entra na tua Conta!",
        "Para solicitares um barbeiro sob demanda agora, precisas de ter sessão iniciada. Queres fazer login ou registar?",
        [
          { text: "Entrar / Registar", onPress: () => router.push('/(auth)/login') },
          { text: "Continuar a navegar", style: "cancel" }
        ]
      );
      return;
    }

    router.push({
      pathname: '/booking/select-service',
      params: {
        lat: String(location?.coords.latitude || -8.8368),
        lng: String(location?.coords.longitude || 13.2332),
      }
    });
  };

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['barbershops', search, activeCategory, location?.coords.latitude],
    queryFn: () => {
      if (activeCategory === 'nearby' && location) {
        return BarbershopService.getNearby(location.coords.latitude, location.coords.longitude);
      }
      return BarbershopService.listAll({ search });
    },
  });

  const rawItems = data?.items || data || [];
  const allItems = Array.isArray(rawItems) ? rawItems : [];

  const filteredItems = (() => {
    switch (activeCategory) {
      case 'premium': return allItems.filter((i: any) => i.is_premium);
      case 'top':     return [...allItems].sort((a: any, b: any) => (b.average_rating || 0) - (a.average_rating || 0));
      default:        return allItems;
    }
  })();

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome Row */}
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeLeft}>
          <Text style={styles.welcomeText}>Olá,</Text>
          <Text style={styles.userName}>{isAuthenticated && user?.name ? user.name : 'Visitante'} 👋</Text>
        </View>
        <View style={styles.locationBadge}>
          <MapPin size={12} color="#f59e0b" />
          <Text style={styles.locationText} numberOfLines={1}>
            {location ? 'Luanda, AO' : 'Angola'}
          </Text>
        </View>
      </View>

      {/* Visual Toggle between List and Map */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeBtn, viewMode === 'list' && styles.viewModeBtnActive]}
          onPress={() => { setViewMode('list'); setSelectedMapBarber(null); }}
          activeOpacity={0.8}
        >
          <ListIcon size={15} color={viewMode === 'list' ? '#000000' : '#a1a1aa'} />
          <Text style={[styles.viewModeBtnText, viewMode === 'list' && styles.viewModeBtnTextActive]}>
            Lista de Salões
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeBtn, viewMode === 'map' && styles.viewModeBtnActive]}
          onPress={() => { setViewMode('map'); setSelectedMapBarber(ONLINE_MAP_BARBERS[0]); }}
          activeOpacity={0.8}
        >
          <MapIcon size={15} color={viewMode === 'map' ? '#000000' : '#a1a1aa'} />
          <View style={styles.liveIndicatorBadge}>
            <View style={styles.liveIndicatorDot} />
            <Text style={[styles.viewModeBtnText, viewMode === 'map' && styles.viewModeBtnTextActive]}>
              Explorar Mapa
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {viewMode === 'list' ? (
        <>
          {/* Premium AI Suggestion / Auto Match Card */}
          <TouchableOpacity
            style={styles.heroCard}
            onPress={handleQuickRequest}
            activeOpacity={0.9}
          >
            <View style={styles.heroGlowLine} />
            <View style={styles.heroContent}>
              <View style={styles.heroTextContainer}>
                <View style={styles.sparkleRow}>
                  <Sparkles size={13} color="#f59e0b" />
                  <Text style={styles.aiBadgeText}>RECOMENDADO KORTA</Text>
                </View>
                <Text style={styles.heroTitle}>Pedir corte agora</Text>
                <Text style={styles.heroSubtitle}>O sistema escolhe o melhor barbeiro ativo mais próximo de ti.</Text>
              </View>
              <View style={styles.heroIconCircle}>
                <Scissors size={22} color="#000000" strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Simplified Search Bar */}
          <View style={styles.searchBar}>
            <Search size={18} color="#71717a" />
            <TextInput
              placeholder="Pesquisar salões ou barbeiros..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
              placeholderTextColor="#71717a"
              keyboardAppearance="dark"
            />
          </View>

          {/* Categories Horizontal Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map(({ id, label, icon: Icon }) => {
              const isActive = activeCategory === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive
                  ]}
                  onPress={() => setActiveCategory(id)}
                  activeOpacity={0.8}
                >
                  <Icon size={14} color={isActive ? '#000000' : '#71717a'} />
                  <Text style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'premium' ? 'Salões Premium' :
               activeCategory === 'top' ? 'Mais Recomendados' :
               activeCategory === 'nearby' ? 'Perto de Ti' :
               'Salões Disponíveis'}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{filteredItems.length}</Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />

      {viewMode === 'list' ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item, index }) => (
            <BarbershopCard
              name={item.name}
              address={item.address}
              city={item.city}
              rating={item.average_rating || 0}
              reviewsCount={item.total_reviews || 0}
              isPremium={item.is_premium}
              status={item.status}
              openHours={item.open_hours}
              imageUrl={item.photos?.[0]?.url}
              index={index}
              onPress={() => router.push(`/barbershop/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#f59e0b"
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Scissors size={44} color="#3f3f46" strokeWidth={1.5} />
                <Text style={styles.emptyTitle}>Nenhum salão encontrado</Text>
                <Text style={styles.emptyText}>Tente refinar a sua pesquisa ou trocar de categoria.</Text>
              </View>
            ) : null
          }
        />
      ) : (
        /* 🗺️ MAPA INTERATIVO PREMIUM DE LUANDA */
        <View style={styles.mapContainer}>
          {renderHeader()}

          {/* Stylized Vector Dark Map Canvas */}
          <View style={styles.mapCanvas}>
            
            {/* Grid Lines Visual */}
            <View style={styles.mapGridRow} />
            <View style={[styles.mapGridRow, { top: '25%' }]} />
            <View style={[styles.mapGridRow, { top: '50%' }]} />
            <View style={[styles.mapGridRow, { top: '75%' }]} />
            <View style={styles.mapGridCol} />
            <View style={[styles.mapGridCol, { left: '25%' }]} />
            <View style={[styles.mapGridCol, { left: '50%' }]} />
            <View style={[styles.mapGridCol, { left: '75%' }]} />

            {/* Stylized Streets/Highways */}
            <View style={styles.streetHighway1} />
            <View style={styles.streetHighway2} />
            <View style={styles.streetSecondary} />

            {/* Map Compass / HUD */}
            <View style={styles.mapHud}>
              <Text style={styles.mapHudText}>📍 Luanda Radar · 4 Barbeiros Ativos</Text>
            </View>

            {/* User Self Location Pin */}
            <View style={[styles.selfPin, { left: '50%', top: '50%' }]}>
              <View style={styles.selfPinPulse} />
              <View style={styles.selfPinDot} />
            </View>

            {/* Live Online Barber Markers */}
            {ONLINE_MAP_BARBERS.map((barber) => {
              const isSelected = selectedMapBarber?.id === barber.id;
              return (
                <TouchableOpacity
                  key={barber.id}
                  style={[
                    styles.barberMarker,
                    { left: barber.coords.x as any, top: barber.coords.y as any }
                  ]}
                  onPress={() => setSelectedMapBarber(barber)}
                  activeOpacity={0.9}
                >
                  {/* Pulsing Glow Animation */}
                  <View style={styles.markerPulse} />
                  
                  {/* Avatar Bubble Container */}
                  <View style={[
                    styles.markerAvatarContainer,
                    isSelected && styles.markerAvatarContainerActive
                  ]}>
                    <Text style={styles.markerEmoji}>{barber.avatar}</Text>
                    {/* Live Online Badge Dot */}
                    <View style={styles.markerOnlineDot} />
                  </View>

                  {/* Tiny Name Tag */}
                  <View style={[styles.markerTag, isSelected && styles.markerTagActive]}>
                    <Text style={[styles.markerTagText, isSelected && styles.markerTagTextActive]}>
                      {barber.name.split(' ')[0]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Sliding Panel with Selected Barber details */}
          {selectedMapBarber && (
            <View style={styles.mapBottomSheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetAvatar}>{selectedMapBarber.avatar}</Text>
                <View style={styles.sheetHeaderInfo}>
                  <View style={styles.sheetNameRow}>
                    <Text style={styles.sheetName}>{selectedMapBarber.name}</Text>
                    <View style={styles.matchScoreBadge}>
                      <Sparkles size={9} color="#000" />
                      <Text style={styles.matchScoreText}>{selectedMapBarber.matchScore}% Match</Text>
                    </View>
                  </View>
                  <View style={styles.sheetSubRow}>
                    <Star size={11} color="#FFD700" fill="#FFD700" />
                    <Text style={styles.sheetRating}>{selectedMapBarber.rating}</Text>
                    <Text style={styles.sheetDot}>•</Text>
                    <Text style={styles.sheetMeta}>{selectedMapBarber.reviews} avaliações</Text>
                    <Text style={styles.sheetDot}>•</Text>
                    <Text style={styles.sheetMeta}>{selectedMapBarber.distance} de ti</Text>
                  </View>
                </View>
              </View>

              {/* Match Smart Suggestion Banner */}
              <View style={styles.matchExplanationBox}>
                <Zap size={13} color="#f59e0b" style={{ marginTop: 1 }} />
                <Text style={styles.matchExplanationText}>
                  {selectedMapBarber.matchScore >= 95 
                    ? `Excelente combinação! ${selectedMapBarber.name} está disponível e desloca-se a alta velocidade.` 
                    : `Ótimo profissional próximo de ti com vaga disponível agora.`}
                </Text>
              </View>

              {/* Specialties Tag Row */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sheetSpecialtiesRow}
              >
                {selectedMapBarber.specialties.map((spec, i) => (
                  <View key={i} style={styles.specTag}>
                    <Text style={styles.specTagText}>{spec}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Bottom Quick Book Button */}
              <TouchableOpacity
                style={styles.sheetBookBtn}
                onPress={() => {
                  if (!isAuthenticated) {
                    Alert.alert("💈 Identifica-te", "Entra ou cria uma conta para fazeres marcações.", [
                      { text: "Entrar", onPress: () => router.push('/(auth)/login') },
                      { text: "Cancelar", style: "cancel" }
                    ]);
                    return;
                  }
                  // Take to service booking flow directly
                  router.push({
                    pathname: '/booking/select-service',
                    params: {
                      lat: String(location?.coords.latitude || -8.8368),
                      lng: String(location?.coords.longitude || 13.2332),
                      preselectedBarberId: selectedMapBarber.id,
                      preselectedBarberName: selectedMapBarber.name
                    }
                  });
                }}
                activeOpacity={0.88}
              >
                <Text style={styles.sheetBookBtnText}>Escolher Profissional & Ver Serviços</Text>
                <ChevronRight size={18} color="#000000" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isLoading && !isRefetching && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>A carregar...</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    paddingBottom: Spacing.xl,
  },
  headerContainer: {
    gap: Spacing.md + 2,
    marginBottom: Spacing.sm,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  welcomeLeft: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#18181B',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.2,
    borderColor: '#27272A',
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  heroCard: {
    backgroundColor: '#18181B',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  heroGlowLine: {
    height: 3,
    backgroundColor: '#f59e0b',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    gap: 12,
  },
  heroTextContainer: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#71717a',
    lineHeight: 16,
    fontWeight: '500',
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  categoriesScroll: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: '#27272A',
    backgroundColor: '#18181B',
  },
  categoryPillActive: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717a',
  },
  categoryTextActive: {
    color: '#000000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '950',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a1a1aa',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '850',
    color: '#FFFFFF',
    marginTop: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '600',
  },

  // ── CONTROLO DE VISTA (LISTA vs MAPA) ──
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#27272A',
    marginBottom: Spacing.sm,
  },
  viewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  viewModeBtnActive: {
    backgroundColor: Colors.primary,
  },
  viewModeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717a',
  },
  viewModeBtnTextActive: {
    color: '#000000',
  },
  liveIndicatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  // ── AI SUGGESTION ──
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.2,
  },

  // ── MAPA CONTAINER E TELAS ──
  mapContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    backgroundColor: '#000000',
  },
  mapCanvas: {
    flex: 1,
    height: 400,
    backgroundColor: '#0d0d0f',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: '#1e1e24',
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  // GRID VIRTUAL DO MAPA
  mapGridRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  mapGridCol: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },

  // ESTRADAS/AUTOESTRADAS ESTILIZADAS
  streetHighway1: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#16161a',
    transform: [{ rotate: '-12deg' }],
  },
  streetHighway2: {
    position: 'absolute',
    left: '48%',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#16161a',
    transform: [{ rotate: '35deg' }],
  },
  streetSecondary: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#131317',
    transform: [{ rotate: '5deg' }],
  },

  // MAP HUD COMPASS
  mapHud: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  mapHudText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // PIN DO PRÓPRIO UTILIZADOR (GPS)
  selfPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  selfPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  selfPinPulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },

  // MARCADORES DE BARBEIRO ONLINE
  barberMarker: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 12,
    transform: [{ translateX: -26 }, { translateY: -26 }],
  },
  markerPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  markerAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.elegant,
  },
  markerAvatarContainerActive: {
    borderColor: Colors.primary,
    backgroundColor: '#27272a',
  },
  markerEmoji: {
    fontSize: 18,
  },
  markerOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#18181b',
  },
  markerTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  markerTagActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  markerTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#a1a1aa',
  },
  markerTagTextActive: {
    color: '#000000',
  },

  // ── BOTTOM SHEET DO MAPA ──
  mapBottomSheet: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: Spacing.md + 2,
    paddingBottom: Spacing.lg,
    position: 'absolute',
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 100,
    ...Shadows.elegant,
  },
  sheetHandle: {
    width: 40,
    height: 4.5,
    backgroundColor: '#3f3f46',
    borderRadius: Radius.full,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetAvatar: {
    fontSize: 32,
    backgroundColor: '#27272A',
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    textAlign: 'center',
    lineHeight: 52,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#3f3f46',
  },
  sheetHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  sheetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  matchScoreText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
  },
  sheetSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  sheetRating: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFD700',
  },
  sheetDot: {
    fontSize: 12,
    color: '#71717a',
  },
  sheetMeta: {
    fontSize: 12,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  matchExplanationBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: Spacing.md,
  },
  matchExplanationText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#d4d4d8',
    flex: 1,
    lineHeight: 16,
  },
  sheetSpecialtiesRow: {
    gap: 8,
    marginBottom: Spacing.md + 2,
    paddingVertical: 2,
  },
  specTag: {
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  specTagText: {
    fontSize: 11,
    color: '#d4d4d8',
    fontWeight: '600',
  },
  sheetBookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 52,
    borderRadius: Radius.lg,
    ...Shadows.gold,
  },
  sheetBookBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
  },
});
