import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing, Radius } from '../../src/theme';
import { Loader2 } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BookingService } from '../../src/services/bookings';
import { addWebSocketListener } from '../../src/hooks/useWebSocket';

export default function Searching() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [requestId, setRequestId] = useState<number | null>(null);
  const requestIdRef = useRef<number | null>(null);
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

  // Animations
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Three dots animations
  const dot1Scale = useRef(new Animated.Value(0.4)).current;
  const dot2Scale = useRef(new Animated.Value(0.4)).current;
  const dot3Scale = useRef(new Animated.Value(0.4)).current;
  
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  // Infinite Rotation for Spinner
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Infinite Staggered Pulsing for Three Dots
  useEffect(() => {
    const createDotAnimation = (scale: Animated.Value, opacity: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.2, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 0.4, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          ]),
        ])
      );
    };

    const anim1 = createDotAnimation(dot1Scale, dot1Opacity, 0);
    const anim2 = createDotAnimation(dot2Scale, dot2Opacity, 200);
    const anim3 = createDotAnimation(dot3Scale, dot3Opacity, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  // Real-time BookingRequest dispatcher & WS listener
  useEffect(() => {
    let isActive = true;
    let wsCleanup: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const startSearch = async () => {
      try {
        console.log('[Searching] Criando request para o serviço:', serviceId);
        const req = await BookingService.createRequest({
          service_id: Number(serviceId),
          lat: parseFloat(lat || '-9.1333'),
          lng: parseFloat(lng || '13.4833'),
          radius_km: 50,
        });

        if (!isActive) return;

        console.log('[Searching] Request criado com ID:', req.id);
        setRequestId(req.id);
        requestIdRef.current = req.id;

        // WebSocket listener
        wsCleanup = addWebSocketListener((data) => {
          if (!isActive) return;
          console.log('[Searching] WS Mensagem recebida:', data);
          
          if (data.type === 'booking_request_accepted' && data.request_id === req.id) {
            console.log('[Searching] Pedido aceite pelo barbeiro!', data);
            
            if (pollInterval) clearInterval(pollInterval);
            if (wsCleanup) wsCleanup();

            router.replace({
              pathname: '/booking/tracking',
              params: {
                lat,
                lng,
                serviceId,
                serviceName,
                price,
                mode,
                deliveryFee,
                bookingId: String(data.booking_id),
                barberId: String(data.request_id),
                barberName: data.barbershop_name || 'Barbeiro Korta',
                barberRating: '4.9',
                totalPrice
              }
            });
          } else if (data.type === 'booking_request_expired' && data.request_id === req.id) {
            console.log('[Searching] Pedido expirou.');
            Alert.alert('Esgotado', 'Não foi possível encontrar barbeiros disponíveis neste momento.');
            if (pollInterval) clearInterval(pollInterval);
            if (wsCleanup) wsCleanup();
            router.replace('/(tabs)');
          }
        });

        // Polling de fallback (caso o WS falhe)
        pollInterval = setInterval(async () => {
          if (!isActive) return;
          try {
            const reqStatus = await BookingService.getRequest(req.id);
            console.log('[Searching] Polling status:', reqStatus.status);
            
            if (reqStatus.status === 'assigned') {
              const myBookings = await BookingService.myBookings();
              const matchingBooking = myBookings.find(
                (b: any) => b.service_id === Number(serviceId) && (b.status === 'pending' || b.status === 'confirmed')
              );

              if (matchingBooking) {
                console.log('[Searching] Polling encontrou booking:', matchingBooking.id);
                if (pollInterval) clearInterval(pollInterval);
                if (wsCleanup) wsCleanup();

                router.replace({
                  pathname: '/booking/tracking',
                  params: {
                    lat,
                    lng,
                    serviceId,
                    serviceName,
                    price,
                    mode,
                    deliveryFee,
                    bookingId: String(matchingBooking.id),
                    barberId: String(matchingBooking.barbershop_id),
                    barberName: matchingBooking.barbershop?.name || 'Barbeiro Korta',
                    barberRating: String(matchingBooking.barbershop?.average_rating || '4.9'),
                    totalPrice
                  }
                });
              }
            } else if (reqStatus.status === 'expired' || reqStatus.status === 'cancelled') {
              if (pollInterval) clearInterval(pollInterval);
              if (wsCleanup) wsCleanup();
              Alert.alert('Status', reqStatus.status === 'expired' ? 'O pedido expirou.' : 'O pedido foi cancelado.');
              router.replace('/(tabs)');
            }
          } catch (e) {
            console.error('[Searching] Erro no polling de fallback:', e);
          }
        }, 3000);

      } catch (err) {
        console.error('[Searching] Erro ao criar request:', err);
        Alert.alert('Erro', 'Erro ao submeter o pedido de serviço. Verifique a sua ligação.');
        router.replace('/(tabs)');
      }
    };

    startSearch();

    return () => {
      isActive = false;
      if (wsCleanup) wsCleanup();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [serviceId, lat, lng]);

  const handleCancel = async () => {
    if (requestIdRef.current) {
      try {
        console.log('[Searching] Cancelando request ID:', requestIdRef.current);
        await BookingService.cancelRequest(requestIdRef.current);
      } catch (err) {
        console.error('Erro ao cancelar pedido:', err);
      }
    }
    router.replace('/(tabs)');
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#000000', '#18181b']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />

        <View style={styles.content}>
          {/* Rotating Spinner */}
          <View style={styles.spinnerContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Loader2 size={64} color="#f59e0b" strokeWidth={1.5} />
            </Animated.View>
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>A procurar barbeiro...</Text>
            <Text style={styles.subtitle}>Estamos a encontrar o melhor barbeiro para ti</Text>
          </View>

          {/* Staggered Pulsing Dots */}
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { transform: [{ scale: dot1Scale }], opacity: dot1Opacity }]} />
            <Animated.View style={[styles.dot, { transform: [{ scale: dot2Scale }], opacity: dot2Opacity }]} />
            <Animated.View style={[styles.dot, { transform: [{ scale: dot3Scale }], opacity: dot3Opacity }]} />
          </View>
        </View>

        {/* Cancel Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>

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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl + 10,
  },
  spinnerContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  cancelButton: {
    backgroundColor: '#18181b',
    borderWidth: 1.5,
    borderColor: '#27272a',
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.8,
  },
  cancelText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '800',
  },
});
