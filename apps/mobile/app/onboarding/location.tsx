import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { MapPin, Navigation } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useAuthStore } from '../../src/store/auth';

export default function LocationPermission() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userType } = params as any;
  console.log("📱 [KORTA] Ecrã de Permissão de Localização carregado! Tipo de usuário:", userType);

  // Animação de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Animação do ícone de GPS (pulsar)
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    // Radar pulsar loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const navigateNext = () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    if (userType === 'barber') {
      if (isAuthenticated) {
        router.replace('/(barber)/dashboard');
      } else {
        router.replace({
          pathname: '/(auth)/login',
          params: { role: 'barber' }
        });
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleRequestPermission = async () => {
    try {
      console.log("📍 [KORTA] A solicitar permissão de GPS...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        console.log("✅ [KORTA] Permissão concedida!");
      } else {
        console.log("⚠️ [KORTA] Permissão negada — avançando mesmo assim.");
      }
    } catch (e) {
      console.error("Erro ao obter permissão:", e);
    } finally {
      navigateNext();
    }
  };

  const handleSkip = () => {
    console.log("⏭️ [KORTA] Utilizador optou por decidir a localização mais tarde.");
    navigateNext();
  };

  return (
    <LinearGradient 
      colors={['#000000', '#18181b']} 
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          
          {/* Ícone radar central */}
          <View style={styles.radarContainer}>
            <Animated.View style={[
              styles.radarRing,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={styles.radarCenter}>
                <MapPin size={48} color="#f59e0b" strokeWidth={1.5} />
              </View>
            </Animated.View>
          </View>

          {/* Título e Explicação */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Ativar Localização</Text>
            <Text style={styles.subtitle}>
              Para podermos mostrar os barbeiros ativos mais próximos de ti e estimar o tempo real de chegada.
            </Text>
          </View>

          {/* Ação */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.button, Shadows.gold]}
              activeOpacity={0.85}
              onPress={handleRequestPermission}
            >
              <Text style={styles.buttonText}>Ativar e Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              activeOpacity={0.7}
              onPress={handleSkip}
            >
              <Text style={styles.skipText}>Decidir mais tarde</Text>
            </TouchableOpacity>
          </View>

          {/* Indicador de progresso: 2 passos para clientes, 3 para barbeiros */}
          <View style={styles.progressDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            {userType === 'barber' && <View style={styles.dot} />}
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
  },
  radarRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  radarCenter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FAFAFA',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa', // Zinc-400
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
    gap: Spacing.md,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 40,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    paddingVertical: Spacing.sm,
  },
  skipText: {
    color: '#71717a', // Zinc-500
    fontSize: 14,
    fontWeight: '600',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3f3f46', // Zinc-700
  },
  dotActive: {
    backgroundColor: '#f59e0b', // Amber-500
    width: 20,
  }
});
