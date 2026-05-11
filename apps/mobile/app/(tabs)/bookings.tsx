import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  Image 
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { Calendar as CalendarIcon, Clock, Scissors, AlertCircle, MapPin } from 'lucide-react-native';
import { BookingService } from '../../src/services/bookings';

export default function BookingsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => BookingService.myBookings(),
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':  return { bg: 'rgba(52, 211, 153, 0.2)', text: '#34D399' };
      case 'pending':    return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B' };
      case 'cancelled':  return { bg: 'rgba(239, 68, 68, 0.2)',  text: '#EF4444' };
      case 'completed':  return { bg: 'rgba(212, 175, 55, 0.2)', text: Colors.primary };
      default:           return { bg: Colors.surface, text: Colors.mutedForeground };
    }
  };

  const renderBooking = ({ item }: { item: any }) => {
    const status = getStatusStyle(item.status);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.shopInfo}>
            <Text style={styles.shopName}>{item.barbershop?.name}</Text>
            <View style={styles.statusBadge} style={{ backgroundColor: status.bg }}>
              <Text style={[styles.statusText, { color: status.text }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.serviceName}>{item.service?.name}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.detailItem}>
            <CalendarIcon size={14} color={Colors.mutedForeground} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.mutedForeground} />
            <Text style={styles.detailText}>{item.time_slot}</Text>
          </View>
          <View style={[styles.detailItem, { flex: 1 }]}>
            <MapPin size={14} color={Colors.mutedForeground} />
            <Text style={styles.detailText} numberOfLines={1}>{item.barbershop?.address}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <CalendarIcon size={64} color={Colors.surface2} />
              <Text style={styles.emptyTitle}>Sem marcações</Text>
              <Text style={styles.emptySubtitle}>As tuas futuras reservas aparecerão aqui.</Text>
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
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  cardHeader: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  serviceName: {
    fontSize: 15,
    color: Colors.mutedForeground,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.foreground,
    fontWeight: '600',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  emptyText: {
    color: Colors.mutedForeground,
    fontSize: 16,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
