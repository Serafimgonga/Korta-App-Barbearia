import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { MapPin, Star, CheckCircle2 } from 'lucide-react-native';

const STATUS_LABELS = {
  on_the_way: 'A caminho',
  arrived: 'Chegou',
  in_service: 'Em serviço',
  completed: 'Concluído',
};

export default function BarberFound() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { bookingId } = params as any;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('on_the_way');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setBooking({
          id: bookingId,
          barbershop: { name: 'Barber King Studio', latitude: -8.8383, longitude: 13.2344 },
          barber: {
            id: 1,
            name: 'João Mbala',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            average_rating: 4.8,
            total_reviews: 45,
          },
          service: { name: 'Corte + Barba', price: 4000 },
          distance_m: 1200,
        });
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar booking:', err);
        setLoading(false);
      }
    };

    fetchBooking();
    const statusInterval = setInterval(() => {
      setStatus((prev) => {
        const statuses = ['on_the_way', 'arrived', 'in_service', 'completed'];
        const idx = statuses.indexOf(prev);
        return idx < statuses.length - 1 ? statuses[idx + 1] : 'completed';
      });
    }, 30000);

    return () => clearInterval(statusInterval);
  }, [bookingId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const statusIndex = Object.keys(STATUS_LABELS).indexOf(status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Barbeiro encontrado! 🎉</Text>
      </View>

      {booking?.barber && (
        <View style={styles.content}>
          <View style={styles.barberCard}>
            <Image source={{ uri: booking.barber.avatar_url }} style={styles.barberAvatar} />
            <Text style={styles.barberName}>{booking.barber.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.rating}>
                {booking.barber.average_rating?.toFixed(1)} ({booking.barber.total_reviews} avaliações)
              </Text>
            </View>
            <View style={styles.distanceRow}>
              <MapPin size={14} color={Colors.mutedForeground} />
              <Text style={styles.distance}>{(booking.distance_m / 1000).toFixed(1)} km</Text>
            </View>
          </View>

          <View style={styles.serviceCard}>
            <Text style={styles.serviceLabel}>Serviço</Text>
            <Text style={styles.serviceName}>{booking.service?.name}</Text>
            <Text style={styles.servicePrice}>{booking.service?.price.toLocaleString('pt-AO')} Kz</Text>
          </View>

          <View style={styles.timeline}>
            <Text style={styles.timelineLabel}>Status do atendimento</Text>
            {Object.entries(STATUS_LABELS).map(([key, label], idx) => (
              <View key={key} style={styles.timelineItem}>
                <View style={[styles.timelineIcon, { backgroundColor: idx <= statusIndex ? Colors.primary : Colors.border }]}>
                  {idx <= statusIndex && <CheckCircle2 size={18} color={Colors.primaryForeground} strokeWidth={3} />}
                </View>
                <Text style={[styles.timelineText, { color: idx <= statusIndex ? Colors.foreground : Colors.mutedForeground }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.infoText}>{booking.barbershop?.name}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {
            if (status === 'completed') {
              router.push({ pathname: '/booking/payment', params: { bookingId } });
            } else {
              Alert.alert('Aguardando', 'O barbeiro ainda está a caminho ou em serviço.');
            }
          }}
        >
          <Text style={styles.ctaText}>{status === 'completed' ? 'Próximo: Pagamento' : 'Aguardando barbeiro...'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  barberCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  barberAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: Spacing.md },
  barberName: { fontSize: 22, fontWeight: '900', color: Colors.foreground },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.xs },
  rating: { fontSize: 14, color: Colors.mutedForeground, fontWeight: '600' },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  distance: { fontSize: 14, color: Colors.mutedForeground, fontWeight: '600' },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceLabel: { fontSize: 11, fontWeight: '700', color: Colors.mutedForeground, textTransform: 'uppercase' },
  serviceName: { fontSize: 18, fontWeight: '800', color: Colors.foreground, marginTop: 4 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 6 },
  timeline: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.lg },
  timelineLabel: { fontSize: 11, fontWeight: '700', color: Colors.mutedForeground, textTransform: 'uppercase', marginBottom: Spacing.md },
  timelineItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  timelineIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  timelineText: { fontSize: 14, fontWeight: '600' },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoText: { fontSize: 14, fontWeight: '600', color: Colors.foreground },
  footer: { padding: Spacing.lg },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
    ...Shadows.gold,
  },
  ctaText: { color: Colors.primaryForeground, fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
});
