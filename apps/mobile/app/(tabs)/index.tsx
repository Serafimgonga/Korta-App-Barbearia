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
  SlidersHorizontal
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const CATEGORIES = [
  { id: 'all',     label: 'Todos',        icon: SlidersHorizontal },
  { id: 'premium', label: 'Premium',      icon: Crown },
  { id: 'top',     label: 'Mais Votados', icon: Star },
  { id: 'nearby',  label: 'Perto de Ti',  icon: Navigation },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

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

      {/* Premium Simplistic CTA Card */}
      <TouchableOpacity
        style={styles.heroCard}
        onPress={handleQuickRequest}
        activeOpacity={0.9}
      >
        <View style={styles.heroGlowLine} />
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Pedir corte agora</Text>
            <Text style={styles.heroSubtitle}>Um barbeiro qualificado vai até à tua localização</Text>
          </View>
          <View style={styles.heroIconCircle}>
            <Scissors size={24} color="#000000" strokeWidth={2.5} />
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
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />
      
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
});
