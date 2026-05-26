import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../src/theme';
import { Scissors } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  const router = useRouter();
  console.log("📱 [KORTA] Ecrã de Boas-Vindas animado carregado!");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Loop de movimento e simulação de corte de tesoura
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const translateX = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 18], // Desloca horizontalmente
  });

  const translateY = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -10, 0], // Efeito flutuação/pulo
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-15deg', '15deg', '-15deg'], // Efeito rotação/tesoura
  });

  return (
    <LinearGradient 
      colors={['#000000', '#18181b']} 
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.content}>
          
          <Animated.View style={[
            styles.logoContainer, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}>
            {/* Ícone Tesoura com Efeito Blur Glow e Animação de Deslocamento/Corte */}
            <View style={styles.glowOuterCircle}>
              <View style={styles.glowInnerCircle}>
                <Animated.View style={{ transform: [{ translateX }, { translateY }, { rotate }] }}>
                  <Scissors size={72} color="#f59e0b" strokeWidth={1.5} />
                </Animated.View>
              </View>
            </View>

            <Text style={styles.title}>KORTA</Text>
            <Text style={styles.subtitle}>Encontra um barbeiro perto de ti em minutos</Text>

            {/* Botão Começar perto da informação */}
            <TouchableOpacity 
              style={[styles.button, Shadows.gold]}
              activeOpacity={0.85}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.buttonText}>Começar</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.version}>v1.0.0 — Luanda, Angola 🇦🇴</Text>
          </Animated.View>
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
    padding: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  glowOuterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#f59e0b',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
      },
      android: {
        elevation: 6,
      }
    }),
  },
  glowInnerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 6,
    marginTop: Spacing.lg,
    fontFamily: Platform.OS === 'ios' ? 'Sora' : 'sans-serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#a1a1aa', // Zinc-400
    marginTop: Spacing.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
    fontWeight: '500',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 48,
    minWidth: 180,
    height: 56,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  version: {
    marginTop: Spacing.xl,
    color: '#71717a', // Zinc-500
    fontSize: 11,
    letterSpacing: 1,
  }
});
