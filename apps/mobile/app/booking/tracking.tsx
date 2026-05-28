import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing, Radius, Shadows } from '../../src/theme';
import { Check, Star, Navigation, MapPin, Scissors, CheckCheck, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingService } from '../../src/services/bookings';
import { addWebSocketListener } from '../../src/hooks/useWebSocket';

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Barbeiro confirmado', iconName: 'check', emoji: '✓' },
  { key: 'on_the_way', label: 'A caminho', iconName: 'moto', emoji: '→' },
  { key: 'arrived', label: 'Chegou', iconName: 'pin', emoji: '📍' },
  { key: 'in_service', label: 'Em serviço', iconName: 'scissors', emoji: '✂️' },
  { key: 'completed', label: 'Concluído', iconName: 'done', emoji: '✓' }
];

export default function Tracking() {
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
    barberRating,
    totalPrice
  } = params as any;

  const finalBarberName = barberName === 'Barbeiro Automático' ? 'Kuyuyu Barber' : (barberName || 'Kuyuyu Barber');
  const finalBarberRating = barberRating && barberRating !== 'undefined' ? barberRating : '4.8';

  const [currentStep, setCurrentStep] = useState(0);

  // Icon animation values
  const iconScale = useRef(new Animated.Value(0.7)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  // Pulse animation for the glow effect
  const glowPulse = useRef(new Animated.Value(1)).current;

  // Run scale/fade entry animation when step changes
  useEffect(() => {
    iconScale.setValue(0.7);
    iconOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentStep]);

  // Glow pulse loop
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        })
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  // Real-time Booking status updater & step sync
  const [bookingStatus, setBookingStatus] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  useEffect(() => {
    let isActive = true;
    let wsCleanup: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    const bId = Number(bookingId);

    if (isNaN(bId)) {
      console.error('[Tracking] bookingId inválido:', bookingId);
      return;
    }

    const checkStatus = async () => {
      try {
        const bookingsList = await BookingService.myBookings();
        const found = bookingsList.find((b: any) => b.id === bId);
        if (found && isActive) {
          console.log('[Tracking] Status inicial:', found.status);
          setBookingStatus(found.status);
        }
      } catch (err) {
        console.error('[Tracking] Erro ao carregar status inicial:', err);
      }
    };

    checkStatus();

    // WebSocket listener para status do booking
    wsCleanup = addWebSocketListener((data) => {
      if (!isActive) return;
      if (data.type === 'booking_status_updated' && data.booking_id === bId) {
        console.log('[Tracking] WS Booking Status:', data.status);
        setBookingStatus(data.status);
      }
    });

    // Polling fallback
    pollInterval = setInterval(async () => {
      if (!isActive) return;
      try {
        const bookingsList = await BookingService.myBookings();
        const found = bookingsList.find((b: any) => b.id === bId);
        if (found) {
          console.log('[Tracking] Polling Booking Status:', found.status);
          setBookingStatus(found.status);
        }
      } catch (e) {
        console.error('[Tracking] Polling error:', e);
      }
    }, 4000);

    return () => {
      isActive = false;
      if (wsCleanup) wsCleanup();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bookingId]);

  // Sincronizar e simular passos com base no status real do Booking
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (bookingStatus === 'pending') {
      setCurrentStep(0);
    } else if (bookingStatus === 'confirmed') {
      // Progredir pelos passos intermediários: Confirmado -> A caminho -> Chegou -> Em serviço
      if (currentStep < 3) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
        }, 8000);
      }
    } else if (bookingStatus === 'completed') {
      setCurrentStep(4);

      // Redireciona para o pagamento
      timer = setTimeout(() => {
        router.replace({
          pathname: '/booking/payment',
          params: {
            bookingId,
            serviceId,
            serviceName,
            price,
            mode,
            deliveryFee,
            barberId,
            barberName: finalBarberName,
            barberRating: finalBarberRating,
            totalPrice
          }
        });
      }, 2000);
    } else if (bookingStatus === 'cancelled') {
      Alert.alert('Cancelado', 'A sua marcação foi cancelada pelo barbeiro.');
      router.replace('/(tabs)');
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [bookingStatus, currentStep]);

  // Render status icon inside the glow container
  const renderStatusIcon = () => {
    const activeIcon = STATUS_STEPS[currentStep].iconName;
    switch (activeIcon) {
      case 'check':
        return <Check size={40} color="#f59e0b" strokeWidth={3} />;
      case 'moto':
        return <Navigation size={40} color="#f59e0b" strokeWidth={2} style={{ transform: [{ rotate: '45deg' }] }} />;
      case 'pin':
        return <MapPin size={40} color="#f59e0b" strokeWidth={2} />;
      case 'scissors':
        return <Scissors size={40} color="#f59e0b" strokeWidth={2} />;
      case 'done':
        return <CheckCheck size={40} color="#f59e0b" strokeWidth={3} />;
      default:
        return null;
    }
  };

  // Remaining time text based on progress
  const getEstimatedTime = () => {
    if (currentStep === 0) return 'Tempo estimado: 15 minutos';
    if (currentStep === 1) return 'Tempo estimado: 10 minutos';
    if (currentStep === 2) return 'Tempo estimado: 5 minutos';
    if (currentStep === 3) return 'Em andamento...';
    return 'Serviço concluído!';
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
          <Text style={styles.headerTitle}>Acompanhar pedido</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{STATUS_STEPS[currentStep].label}</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Animated Big Glow Status Icon */}
          <View style={styles.iconSection}>
            <Animated.View style={[
              styles.glowRing,
              { transform: [{ scale: glowPulse }] },
              Shadows.gold
            ]} />
            <Animated.View style={[
              styles.statusIconContainer,
              {
                opacity: iconOpacity,
                transform: [{ scale: iconScale }]
              }
            ]}>
              {renderStatusIcon()}
            </Animated.View>
          </View>

          {/* Barber Summary */}
          <View style={styles.barberCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>🧔</Text>
            </View>
            <View style={styles.barberDetails}>
              <Text style={styles.barberName}>{finalBarberName}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingValue}>{finalBarberRating}</Text>
              </View>
            </View>
          </View>

          {/* Status Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineLabel}>Timeline de status:</Text>
            <View style={styles.stepsContainer}>
              {STATUS_STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isPending = index > currentStep;

                // Color configuration:
                // Active = Amber (#f59e0b)
                // Completed = Light gray (#a1a1aa)
                // Pending = Dark gray (#3f3f46)
                const nodeColor = isActive ? '#f59e0b' : isCompleted ? '#a1a1aa' : '#3f3f46';
                const textColor = isActive ? '#f59e0b' : isCompleted ? '#a1a1aa' : '#71717a';

                return (
                  <View key={step.key} style={styles.stepRow}>
                    <View style={styles.nodeColumn}>
                      <View style={[
                        styles.nodeCircle,
                        { borderColor: nodeColor, backgroundColor: isActive ? 'rgba(245, 158, 11, 0.1)' : 'transparent' }
                      ]}>
                        <Text style={[styles.nodeIconText, { color: nodeColor }]}>{step.emoji}</Text>
                      </View>
                      {index < STATUS_STEPS.length - 1 && (
                        <View style={[
                          styles.timelineLine,
                          { backgroundColor: isCompleted ? '#a1a1aa' : '#27272a' }
                        ]} />
                      )}
                    </View>
                    <View style={styles.textColumn}>
                      <Text style={[styles.stepText, { color: textColor, fontWeight: isActive ? '800' : '600' }]}>
                        {step.label} {isActive ? '(ATIVO)' : isCompleted ? '(COMPLETO)' : '(PENDENTE)'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Remaining time */}
          <View style={styles.timeFooter}>
            <Clock size={16} color="#71717a" />
            <Text style={styles.timeText}>{getEstimatedTime()}</Text>
          </View>

        </ScrollView>
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
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f59e0b',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  iconSection: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: Spacing.md + 2,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  avatarText: {
    fontSize: 22,
  },
  barberDetails: {
    flex: 1,
    gap: 4,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a1a1aa',
  },
  timelineCard: {
    backgroundColor: '#18181B',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  timelineLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  stepsContainer: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    minHeight: 52,
  },
  nodeColumn: {
    alignItems: 'center',
    width: 24,
    height: '100%',
  },
  nodeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeIconText: {
    fontSize: 11,
    fontWeight: '900',
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -12,
    width: 1.5,
    zIndex: 1,
  },
  textColumn: {
    flex: 1,
    paddingTop: 3,
  },
  stepText: {
    fontSize: 14,
  },
  timeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xs,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
  },
});
