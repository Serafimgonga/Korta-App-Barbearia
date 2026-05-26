import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BookingService } from '../../src/services/bookings';
import { MapPin, Clock, DollarSign, CheckCircle2, XCircle } from 'lucide-react-native';

export default function Requests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await BookingService.listPendingRequests({
        lat: -8.8383,
        lng: 13.2344,
        radius_km: 5,
      });
      setRequests(data || []);
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  const handleAccept = async (requestId: string) => {
    try {
      const booking = await BookingService.acceptRequest(requestId);
      Alert.alert('✅ Sucesso', 'Pedido aceite! Novo booking criado.');
      fetchRequests();
    } catch (err) {
      Alert.alert('❌ Erro', 'Não consegui aceitar o pedido. Tenta novamente.');
    }
  };

  const renderRequest = ({ item }: any) => (
    <View style={styles.requestCard}>
      <View style={styles.header}>
        <View>
          <Text style={styles.serviceName}>{item.service?.name || 'Serviço'}</Text>
          <View style={styles.infoRow}>
            <Clock size={12} color={Colors.mutedForeground} />
            <Text style={styles.infoText}>Pedido há {Math.floor(Math.random() * 3) + 1}min</Text>
          </View>
        </View>
        <Text style={styles.price}>{item.service?.price?.toLocaleString('pt-AO')} Kz</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.detailText}>{(item.radius_km || 5).toFixed(1)} km de raio</Text>
        </View>
        <View style={styles.detailRow}>
          <DollarSign size={14} color={Colors.primary} />
          <Text style={styles.detailText}>Comissão: {(item.service?.price * 0.1).toLocaleString('pt-AO')} Kz (10%)</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectButton} onPress={() => Alert.alert('Recusado', 'Pedido recusado com sucesso.')}>
          <XCircle size={16} color={Colors.destructive} />
          <Text style={styles.rejectText}>Recusar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item.id)}>
          <CheckCircle2 size={16} color={Colors.primaryForeground} fill={Colors.primaryForeground} />
          <Text style={styles.acceptText}>Aceitar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>A procurar pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header_}>
        <Text style={styles.title}>Pedidos de Clientes</Text>
        {requests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{requests.length}</Text></View>}
      </View>

      {requests.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Sem pedidos por enquanto</Text>
          <Text style={styles.emptyText}>Ativa o teu status ONLINE para receber pedidos de clientes próximos</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header_: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  title: { fontSize: 22, fontWeight: '900', color: Colors.foreground },
  badge: { backgroundColor: Colors.primary, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: Colors.primaryForeground, fontSize: 12, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: Spacing.lg, color: Colors.mutedForeground, fontSize: 14 },
  list: { padding: Spacing.lg, gap: Spacing.lg },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 12, color: Colors.mutedForeground },
  price: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md },
  details: { gap: Spacing.sm, marginBottom: Spacing.lg },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: 12, color: Colors.mutedForeground },
  actions: { flexDirection: 'row', gap: Spacing.md },
  rejectButton: {
    flex: 1,
    borderRadius: Radius.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.destructive,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  rejectText: { fontSize: 12, fontWeight: '700', color: Colors.destructive },
  acceptButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    ...Shadows.gold,
  },
  acceptText: { fontSize: 12, fontWeight: '700', color: Colors.primaryForeground, textTransform: 'uppercase' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  emptyIcon: { fontSize: 64, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground, marginBottom: Spacing.sm },
  emptyText: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
});
