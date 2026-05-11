import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import { BarbershopCard } from '../../src/components/BarbershopCard';
import { Search, MapPin, Navigation } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['barbershops', search, location?.coords.latitude, location?.coords.longitude],
    queryFn: () => {
      if (location && !search) {
        return BarbershopService.getNearby(
          location.coords.latitude,
          location.coords.longitude
        );
      }
      return BarbershopService.listAll({ search });
    },
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.locationContainer}>
        <MapPin size={16} color={location ? Colors.success : Colors.accent} />
        <Text style={styles.locationText}>
          {location ? 'A tua localização' : 'Ícolo e Bengo, Angola'}
        </Text>
        {location && (
          <View style={styles.nearbyBadge}>
            <Navigation size={10} color="#FFF" />
            <Text style={styles.nearbyBadgeText}>PERTO DE TI</Text>
          </View>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.textSecondary} />
        <TextInput
          placeholder="Procuras alguma barbearia?"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <Text style={styles.sectionTitle}>Melhores Barbearias</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BarbershopCard
            name={item.name}
            address={item.address}
            rating={item.average_rating}
            reviewsCount={item.total_reviews}
            isPremium={item.is_premium}
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
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma barbearia encontrada.</Text>
            </View>
          ) : null
        }
      />
      
      {isLoading && !isRefetching && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  nearbyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
    gap: 4,
  },
  nearbyBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  listContent: {
    padding: Spacing.md,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});
