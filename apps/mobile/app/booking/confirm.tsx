import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Spacing, Radius, Shadows } from '../../src/theme';
import { ChevronLeft, Star, MapPin } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConfirmBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    lat,
    lng,
    serviceId,
    serviceName,
    price,
    mode,
    deliveryFee,
    barberId,
    barberName,
    barberRating
  } = params as any;

  // Calculate values
  const svcPrice = Number(price || 500);
  const delFee = Number(deliveryFee || 0);
  const totalPrice = svcPrice + delFee;

  const finalServiceName = serviceName || 'Corte cabelo';
  const finalBarberName = barberName === 'Barbeiro Automático' ? 'Kuyuyu Barber' : (barberName || 'Kuyuyu Barber');
  const finalBarberRating = barberRating && barberRating !== 'undefined' ? barberRating : '4.8';

  // Get duration based on service name
  const duration = finalServiceName.toLowerCase().includes('barba')
    ? '10 minutos'
    : finalServiceName.toLowerCase().includes('kit') || finalServiceName.toLowerCase().includes('combo')
    ? '30 minutos'
    : '15 minutos';

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleConfirm = () => {
    router.push({
      pathname: '/booking/searching',
      params: {
        lat,
        lng,
        serviceId,
        serviceName: finalServiceName,
        price: String(svcPrice),
        mode,
        deliveryFee: String(delFee),
        barberId,
        barberName: finalBarberName,
        barberRating: finalBarberRating,
        totalPrice: String(totalPrice)
      }
    });
  };

  return (
    <LinearGradient
      colors={['#000000', '#18181b']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#f59e0b" />
          </Pressable>
          <Text style={styles.headerTitle}>Confirmar pedido</Text>
          <View style={styles.placeholder} />
        </View>

        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Card 1: Serviço */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Serviço</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardMainText}>{finalServiceName}</Text>
                <Text style={styles.cardPriceText}>{svcPrice.toLocaleString('pt-AO')} Kz</Text>
              </View>
              <Text style={styles.cardSubText}>{duration}</Text>
            </View>

            {/* Card 2: Modo */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Modo</Text>
              <View style={styles.cardRow}>
                <Text style={styles.cardMainText}>
                  {mode === 'home' ? '🏠 Atendimento ao domicílio' : '🏪 Atendimento no salão'}
                </Text>
              </View>
            </View>

            {/* Card 3: Barbeiro */}
            <View style={styles.summaryCard}>
              <Text style={styles.cardSectionTitle}>Barbeiro</Text>
              <View style={styles.barberRow}>
                <View style={styles.barberAvatar}>
                  <Text style={styles.avatarEmoji}>🧔</Text>
                </View>
                <View style={styles.barberDetails}>
                  <Text style={styles.cardMainText}>{finalBarberName}</Text>
                  <View style={styles.barberSubRow}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.barberRatingText}>{finalBarberRating}</Text>
                    <Text style={styles.bulletDivider}>|</Text>
                    <MapPin size={12} color="#71717a" />
                    <Text style={styles.barberDistanceText}>0.5km</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card 4: Total */}
            <View style={styles.summaryCard}>
              <View style={styles.cardRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{totalPrice.toLocaleString('pt-AO')} Kz</Text>
              </View>
            </View>

          </ScrollView>

          {/* Action Button */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
                Shadows.gold
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.actionButtonText}>Confirmar pedido</Text>
            </Pressable>
          </View>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  summaryCard: {
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: Spacing.lg,
    gap: 8,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardPriceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f59e0b',
  },
  cardSubText: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  barberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  barberDetails: {
    flex: 1,
    gap: 4,
  },
  barberSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barberRatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bulletDivider: {
    color: '#3f3f46',
    fontSize: 12,
  },
  barberDistanceText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f59e0b',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#000000',
  },
  actionButton: {
    backgroundColor: '#f59e0b',
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.85,
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
