import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, SafeAreaView, RefreshControl
} from 'react-native';
import { Colors, Spacing, Radius } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import { BookingService, BookingStatusPayload } from '../../src/services/bookings';
import { useBarberStore } from '../../src/store/barber';
import ShopSelectorHeader from '../../src/components/ShopSelectorHeader';
import { Calendar, Clock, User, CheckCircle, XCircle, Scissors } from 'lucide-react-native';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Pendente',   color: '#F59E0B', bg: '#F59E0B22' },
  confirmed: { label: 'Confirmado', color: '#34D399', bg: '#34D39922' },
  completed: { label: 'Concluído',  color: Colors.primary, bg: Colors.accent },
  cancelled: { label: 'Cancelado',  color: '#EF4444', bg: '#EF444422' },
  no_show:   { label: 'Faltou',     color: '#6B7280', bg: '#6B728022' },
};

export default function MyBookingsScreen() {
  const { shops, activeShop, loadShops, loading } = useBarberStore();
  const [bookings, setBookings]     = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState<BookingStatus | 'all'>('all');

  useEffect(() => { loadShops(); }, []);
  useEffect(() => { if (activeShop) loadBookings(); }, [activeShop]);

  const loadBookings = async () => {
    if (!activeShop) return;
    try {
      const data = await BookingService.getActiveShopBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch { setBookings([]); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const updateStatus = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      // Backend schema expects BookingStatus: pending, confirmed, cancelled, completed, no_show
      await BookingService.updateStatus(bookingId, { status: newStatus as any });
      await loadBookings();
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.detail || 'Não foi possível actualizar o estado.');
    }
  };

  const confirmAction = (bookingId: number, action: BookingStatus, label: string) => {
    Alert.alert(
      `${label} marcação?`,
      `Tens a certeza que queres marcar esta marcação como "${label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: label, onPress: () => updateStatus(bookingId, action) }
      ]
    );
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const pending = bookings.filter(b => b.status === 'pending').length;

  if (loading) return <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  if (shops.length === 0) {
    return (
      <View style={styles.centered}>
        <Calendar size={40} color={Colors.mutedForeground} strokeWidth={1} />
        <Text style={styles.emptyTitle}>Sem barbearias</Text>
        <Text style={styles.emptyDesc}>Cria primeiro a tua barbearia para gerir agendamentos.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Seletor de loja */}
      <ShopSelectorHeader />

      {/* Resumo + Filtros */}
      <View style={styles.summary}>
        {pending > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>⚡ {pending} pendente{pending > 1 ? 's' : ''} a aguardar confirmação</Text>
          </View>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'Todos' : STATUS_CONFIG[f]?.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Calendar size={36} color={Colors.mutedForeground} strokeWidth={1} />
            <Text style={styles.emptyTitle}>Sem agendamentos</Text>
            <Text style={styles.emptyDesc}>Não há marcações com este filtro.</Text>
          </View>
        ) : (
          filtered.map((booking) => {
            const cfg = STATUS_CONFIG[booking.status as BookingStatus] || STATUS_CONFIG.pending;
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingClient}>
                    <View style={styles.clientAvatar}>
                      <User size={16} color={Colors.primary} />
                    </View>
                    <View>
                      <Text style={styles.clientName}>{booking.user?.name || 'Cliente'}</Text>
                      <Text style={styles.serviceName}>{booking.service?.name || '—'}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusPillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>

                <View style={styles.bookingMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={13} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{booking.date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color={Colors.mutedForeground} />
                    <Text style={styles.metaText}>{booking.time_slot}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Scissors size={13} color={Colors.primary} />
                    <Text style={[styles.metaText, { color: Colors.primary, fontWeight: '700' }]}>
                      {booking.total_price?.toLocaleString('pt-AO')} Kz
                    </Text>
                  </View>
                </View>

                {booking.notes && (
                  <Text style={styles.notes}>📝 {booking.notes}</Text>
                )}

                {/* Acções rápidas para marcações pendentes */}
                {booking.status === 'pending' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionConfirm}
                      onPress={() => confirmAction(booking.id, 'confirmed', 'Confirmar')}
                    >
                      <CheckCircle size={16} color="#FFF" />
                      <Text style={styles.actionConfirmText}>Confirmar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionCancel}
                      onPress={() => confirmAction(booking.id, 'cancelled', 'Cancelar')}
                    >
                      <XCircle size={16} color={Colors.error} />
                      <Text style={styles.actionCancelText}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {booking.status === 'confirmed' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionConfirm}
                      onPress={() => confirmAction(booking.id, 'completed', 'Concluir')}
                    >
                      <CheckCircle size={16} color="#FFF" />
                      <Text style={styles.actionConfirmText}>Marcar como Concluído</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: 12 },
  shopSelector: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  shopTab: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  shopTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  shopTabText: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  shopTabTextActive: { color: Colors.primaryForeground },

  summary: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },
  pendingBadge: {
    backgroundColor: '#F59E0B22', borderRadius: Radius.md, padding: Spacing.sm,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: '#F59E0B44',
  },
  pendingBadgeText: { fontSize: 13, fontWeight: '700', color: '#F59E0B' },
  filters: { paddingVertical: Spacing.sm, gap: 8 },
  filterBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.mutedForeground },
  filterTextActive: { color: Colors.primaryForeground },

  list: { padding: Spacing.md, gap: Spacing.sm },
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: Spacing.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  emptyDesc: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },

  bookingCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingClient: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  clientAvatar: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  clientName: { fontSize: 15, fontWeight: '800', color: Colors.foreground },
  serviceName: { fontSize: 13, color: Colors.mutedForeground },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusPillText: { fontSize: 11, fontWeight: '900' },

  bookingMeta: { flexDirection: 'row', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.mutedForeground },
  notes: { fontSize: 13, color: Colors.mutedForeground, fontStyle: 'italic' },

  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  actionConfirm: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.success, borderRadius: Radius.md, paddingVertical: 10,
  },
  actionConfirmText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  actionCancel: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#EF444422', borderRadius: Radius.md, paddingVertical: 10,
    borderWidth: 1, borderColor: '#EF444444',
  },
  actionCancelText: { fontSize: 14, fontWeight: '800', color: Colors.error },
});
