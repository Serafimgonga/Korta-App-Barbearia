import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, ScrollView,
  RefreshControl, ActivityIndicator, TouchableOpacity,
  Dimensions, Animated, Platform
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import {
  BarbershopCard, CompactBarbershopCard, FeaturedCutCard
} from '../../src/components/BarbershopCard';
import {
  Search, MapPin, Navigation, Scissors, Star, Crown,
  Flame, TrendingUp, Filter, SlidersHorizontal
} from 'lucide-react-native';

const FEATURED_CUTS = [
  { imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400', caption: 'Fade Perfeito', shopName: 'KORTA Premium' },
  { imageUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400', caption: 'Corte Clássico', shopName: 'Elite Cuts' },
  { imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400', caption: 'Barba Premium', shopName: 'Gold Blade' },
  { imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400', caption: 'Degradê Moderno', shopName: 'UrbanCuts' },
  { imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400', caption: 'Estilo Afro', shopName: 'Razor Sharp' },
  { imageUrl: 'https://images.unsplash.com/photo-1534297635766-a262cdcb8ee4?w=400', caption: 'Linha Definida', shopName: 'Barber King' },
];

const CATEGORIES = [
  { id: 'all',     label: 'Todos',        icon: SlidersHorizontal },
  { id: 'premium', label: 'Premium',      icon: Crown },
  { id: 'top',     label: 'Mais Votados', icon: Star },
  { id: 'nearby',  label: 'Perto de Ti',  icon: Navigation },
];

// Componente com animação de fade-in simples
const FadeInView = ({ delay = 0, children, style }: any) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
};

const QuickRequestCTA = ({ onPress }: { onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={styles.ctaButton} 
        activeOpacity={0.85}
        onPress={onPress}
      >
        <Text style={styles.ctaButtonText}>Pedir corte agora</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleQuickRequest = () => {
    router.push({
      pathname: '/booking/searching',
      params: {
        serviceId: '1',
        lat: String(location?.coords.latitude || -8.8368),
        lng: String(location?.coords.longitude || 13.2332),
        serviceName: 'Corte Premium'
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

  const premiumShops = allItems.filter((i: any) => i.is_premium).slice(0, 6);

  const renderHeader = () => (
    <View>
      {/* Header com Logo Grande e Localização */}
      <FadeInView delay={100}>
        <View style={styles.headerRow}>
          <Text style={styles.largeLogo}>KORTA</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#f59e0b" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location ? 'Luanda, Angola 📍' : 'Angola 🇦🇴'}
            </Text>
          </View>
        </View>
      </FadeInView>

      {/* CTA Principal */}
      <QuickRequestCTA onPress={handleQuickRequest} />

      {/* Pesquisa */}
      <FadeInView delay={200}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.mutedForeground} />
          <TextInput
            placeholder="Procura barbearias, cortes..."
            value={search} onChangeText={setSearch}
            style={styles.searchInput} placeholderTextColor={Colors.mutedForeground}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* Categorias */}
      <FadeInView delay={300}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <TouchableOpacity
              key={id}
              style={[styles.categoryPill, activeCategory === id && styles.categoryPillActive]}
              onPress={() => setActiveCategory(id)}
              activeOpacity={0.8}
            >
              <Icon size={14} color={activeCategory === id ? Colors.primaryForeground : Colors.mutedForeground} />
              <Text style={[styles.categoryText, activeCategory === id && styles.categoryTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FadeInView>

      {/* 🔥 Cortes em Destaque */}
      <FadeInView delay={400}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <Flame size={18} color={Colors.error} />
            <Text style={styles.sectionTitle}>Cortes em Destaque</Text>
          </View>
          <Text style={styles.seeAll}>Ver todos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {FEATURED_CUTS.map((cut, i) => (
            <FeaturedCutCard key={i} imageUrl={cut.imageUrl} caption={cut.caption} shopName={cut.shopName} index={i} />
          ))}
        </ScrollView>
      </FadeInView>

      {/* 👑 Premium */}
      {premiumShops.length > 0 && (
        <FadeInView delay={500}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLeft}>
              <Crown size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Premium</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveCategory('premium')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {premiumShops.map((shop: any, i: number) => (
              <CompactBarbershopCard
                key={shop.id} name={shop.name}
                imageUrl={shop.photos?.[0]?.url}
                rating={shop.average_rating || 0} city={shop.city}
                isPremium={shop.is_premium} index={i}
                onPress={() => router.push(`/barbershop/${shop.id}`)}
              />
            ))}
          </ScrollView>
        </FadeInView>
      )}

      {/* Título lista principal */}
      <FadeInView delay={600}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionLeft}>
            <TrendingUp size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>
              {activeCategory === 'premium' ? 'Barbearias Premium' :
               activeCategory === 'top' ? 'Melhor Avaliadas' :
               activeCategory === 'nearby' ? 'Perto de Ti' :
               'Todas as Barbearias'}
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredItems.length}</Text>
          </View>
        </View>
      </FadeInView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item: any) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item, index }) => (
          <BarbershopCard
            name={item.name} address={item.address} city={item.city}
            rating={item.average_rating || 0} reviewsCount={item.total_reviews || 0}
            isPremium={item.is_premium} status={item.status}
            openHours={item.open_hours} imageUrl={item.photos?.[0]?.url}
            index={index} onPress={() => router.push(`/barbershop/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Scissors size={48} color={Colors.mutedForeground} strokeWidth={1} />
              <Text style={styles.emptyTitle}>Nenhuma barbearia encontrada</Text>
              <Text style={styles.emptyText}>Tenta outra pesquisa ou categoria diferente.</Text>
            </View>
          ) : null
        }
      />

      {isLoading && !isRefetching && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>A carregar barbearias...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  largeLogo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#f59e0b', // Amber-500
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'Sora' : 'sans-serif',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mutedForeground,
  },
  ctaButton: {
    backgroundColor: '#f59e0b', // Amber-500
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  searchContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md, height: 54,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md, ...Shadows.elegant,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 15, color: Colors.foreground },
  filterButton: {
    width: 38, height: 38, borderRadius: Radius.md,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
  },

  categoriesContainer: { paddingBottom: Spacing.md, gap: Spacing.sm },
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  categoryTextActive: { color: Colors.primaryForeground },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: Colors.foreground },
  seeAll: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  countBadge: {
    backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: Radius.full,
  },
  countBadgeText: { fontSize: 12, fontWeight: '900', color: Colors.primaryForeground },
  horizontalScroll: { paddingBottom: Spacing.sm, paddingRight: Spacing.md },

  listContent: { padding: Spacing.md },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(13,13,13,0.85)',
  },
  loadingCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, ...Shadows.elegant,
  },
  loadingText: { fontSize: 14, color: Colors.mutedForeground, fontWeight: '600' },

  emptyContainer: { padding: Spacing.xxl, alignItems: 'center', gap: Spacing.sm },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  emptyText: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },
});
