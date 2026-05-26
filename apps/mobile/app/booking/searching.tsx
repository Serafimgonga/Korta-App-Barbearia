import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BookingService } from '../../src/services/bookings';
import { addWebSocketListener } from '../../src/hooks/useWebSocket';
import { Compass, ArrowRight } from 'lucide-react-native';

export default function Searching() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { serviceId, lat, lng, serviceName } = params as any;

  const [requestId, setRequestId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>('searching');
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState<number>(5);
  const [countdown, setCountdown] = useState<number>(60);

  // Valores de Animação
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const timerRef = useRef<any>(null);
  const fallbackIntervalRef = useRef<any>(null);

  // Loop de Animação do Radar
  useEffect(() => {
    const startPulse = () => {
      pulseAnim.setValue(0.6);
      opacityAnim.setValue(0.8);
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 2.2,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => startPulse());
    };

    startPulse();
  }, []);

  // Criação do Pedido
  const createRequest = async (currentRadius: number) => {
    try {
      setLoading(true);
      const resp = await BookingService.createRequest({
        service_id: Number(serviceId),
        lat: Number(lat),
        lng: Number(lng),
        radius_km: currentRadius,
      });
      setRequestId(resp.id);
      setStatus(resp.status || 'requested');
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
      Alert.alert('Erro', 'Não foi possível iniciar o pedido de busca.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createRequest(radius);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    };
  }, []);

  // Cronómetro Regressivo
  useEffect(() => {
    if (!requestId) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [requestId]);

  // Escuta WebSocket e Fallback Polling lento
  useEffect(() => {
    if (!requestId) return;

    // Subscrever mensagens WebSocket em tempo real para ação instantânea
    const removeWsListener = addWebSocketListener((data) => {
      // Verifica se a mensagem diz respeito a este pedido
      if (data.request_id === requestId || (data.booking_id && data.type === 'booking_request_accepted')) {
        if (data.type === 'booking_request_accepted') {
          if (timerRef.current) clearInterval(timerRef.current);
          if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
          router.replace('/(tabs)/bookings');
        } else if (data.type === 'booking_request_expired') {
          if (timerRef.current) clearInterval(timerRef.current);
          if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
          Alert.alert('Sem barbeiros', 'Nenhum barbeiro aceitou o pedido nas redondezas.');
          router.back();
        }
      }
    });

    // Fallback lento a cada 10 segundos apenas em caso de instabilidade de rede / quebra de socket
    fallbackIntervalRef.current = setInterval(async () => {
      try {
        const req = await BookingService.getRequest(requestId);
        setStatus(req.status || 'requested');
        if (req.status === 'assigned') {
          if (timerRef.current) clearInterval(timerRef.current);
          if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
          router.replace('/(tabs)/bookings');
        } else if (req.status === 'expired' || req.status === 'cancelled') {
          if (timerRef.current) clearInterval(timerRef.current);
          if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
          Alert.alert('Sem barbeiros', 'O pedido expirou ou foi cancelado.');
          router.back();
        }
      } catch (err) {
        console.error('Erro no fallback do pedido:', err);
      }
    }, 10000);

    return () => {
      removeWsListener();
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);
    };
  }, [requestId]);

  const handleTimeout = async () => {
    try {
      if (requestId) {
        await BookingService.cancelRequest(requestId);
      }
      Alert.alert(
        'Tempo Limite Excedido',
        'Não foi possível encontrar um barbeiro online a tempo. Queres tentar novamente expandindo o raio de busca?',
        [
          { text: 'Tentar com +5km', onPress: () => expandRadius() },
          { text: 'Cancelar', onPress: () => router.back(), style: 'cancel' },
        ]
      );
    } catch (err) {
      console.error('Erro ao expirar pedido:', err);
      router.back();
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);

      if (requestId) {
        await BookingService.cancelRequest(requestId);
      }
      router.back();
    } catch (err) {
      console.error('Erro ao cancelar pedido:', err);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const expandRadius = async () => {
    try {
      setLoading(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (fallbackIntervalRef.current) clearInterval(fallbackIntervalRef.current);

      if (requestId) {
        try {
          await BookingService.cancelRequest(requestId);
        } catch (e) {
          // ignora erro ao tentar cancelar
        }
      }

      const nextRadius = radius + 5;
      setRadius(nextRadius);
      setCountdown(60); // reset countdown

      await createRequest(nextRadius);
    } catch (err) {
      console.error('Erro ao expandir raio:', err);
      Alert.alert('Erro', 'Não foi possível atualizar o raio de busca.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>A procurar barbeiro…</Text>
        <Text style={styles.subtitle}>{serviceName ?? 'Serviço Selecionado'}</Text>
      </View>

      <View style={styles.centerArea}>
        {/* Efeito Radar Pulsante */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.radarRing,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim,
              },
            ]}
          />
          <View style={styles.radarCenter}>
            <Text style={styles.timerText}>{formatTime(countdown)}</Text>
            <Compass size={24} color={Colors.primary} style={styles.radarIcon} />
          </View>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>Raio de busca: {radius} km</Text>
        </View>

        <Text style={styles.hintText}>
          A enviar pedido para os barbeiros ativos próximos de ti. Por favor, aguarda.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={expandRadius}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primaryForeground} />
          ) : (
            <>
              <Text style={styles.expandButtonText}>Expandir Raio (+5km)</Text>
              <ArrowRight size={18} color={Colors.primaryForeground} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar Pedido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.foreground,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  radarContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  radarCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.elegant,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.foreground,
    fontVariant: ['tabular-nums'],
  },
  radarIcon: {
    marginTop: 4,
  },
  badge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  hintText: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.xl,
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    ...Shadows.gold,
  },
  expandButtonText: {
    color: Colors.primaryForeground,
    fontWeight: '900',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.error,
    fontWeight: '800',
    fontSize: 15,
  },
});
