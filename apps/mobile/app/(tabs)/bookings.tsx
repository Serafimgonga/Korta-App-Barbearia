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
import { Colors, Spacing, Radius } from '../../src/theme';
import api from '../../src/api/client';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react-native';

export default function BookingsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/me');
      return response.data;
    },
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: '#E3F9E5', text: '#1F7A33' };
      case 'pending': return { bg: '#FFF4E5', text: '#B76E00' };
      case 'cancelled': return { bg: '#FFEBEB', text: '#CF222E' };
      default: return { bg: Colors.surface, text: Colors.textSecondary };
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
            <CalendarIcon size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.time_slot}</Text>
          </View>
          <View style={[styles.detailItem, { flex: 1 }]}>
            <MapPin size={14} color={Colors.textSecondary} />
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
              <CalendarIcon size={64} color={Colors.gray[300]} />
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
    backgroundColor: Colors.surface,
  },
  listContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  shopInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  serviceName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
