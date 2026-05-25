import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BookingService } from '../../src/services/bookings';

export default function Searching() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { serviceId, lat, lng, serviceName } = params as any;

  const [requestId, setRequestId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('searching');
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const doRequest = async () => {
      try {
        setLoading(true);
        const resp = await BookingService.createRequest({
          service_id: Number(serviceId),
          lat: Number(lat),
          lng: Number(lng),
          radius_km: 5,
        });
        setRequestId(resp.id);
        setStatus(resp.status || 'requested');
      } catch (err) {
        console.error('Erro ao criar pedido:', err);
        Alert.alert('Erro', 'Não foi possível criar o pedido.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    doRequest();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!requestId) return;

    intervalRef.current = setInterval(async () => {
      try {
        const req = await BookingService.getRequest(requestId as number);
        setStatus(req.status || 'requested');
        if (req.status === 'assigned') {
          // Booking should now exist; navegar para bookings
          if (intervalRef.current) clearInterval(intervalRef.current);
          router.replace('/(tabs)/bookings');
        }
        if (req.status === 'expired' || req.status === 'cancelled') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          Alert.alert('Sem barbeiros', 'Nenhum barbeiro aceitou o pedido. Tenta aumentar o raio.');
          router.back();
        }
      } catch (err) {
        console.error('Erro ao obter estado do pedido:', err);
      }
    }, 3000) as unknown as number;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [requestId]);

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>A procurar barbeiro…</Text>
        <Text style={styles.subtitle}>{serviceName ?? 'Serviço'}</Text>
      </View>

      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.statusText}>Estado: {status}</Text>
        <Text style={styles.hint}>Iremos notificar quando um barbeiro aceitar. Tempo médio: 1–2 minutos.</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancelar pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: Colors.foreground },
  subtitle: { fontSize: 14, color: Colors.mutedForeground, marginTop: 6 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  statusText: { marginTop: 12, color: Colors.foreground, fontWeight: '700' },
  hint: { marginTop: 8, color: Colors.mutedForeground, textAlign: 'center', paddingHorizontal: 24 },
  footer: { padding: Spacing.lg },
  cancelButton: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center' },
  cancelText: { color: Colors.primary, fontWeight: '800' },
});
