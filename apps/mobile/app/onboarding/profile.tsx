import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { User, Scissors } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileChoice() {
  const router = useRouter();
  console.log("📱 [KORTA] Ecrã de Escolha de Perfil carregado!");

  // Animação de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Animações de toque para os dois botões
  const clientScale = useRef(new Animated.Value(1)).current;
  const barberScale = useRef(new Animated.Value(1)).current;

  const [selectedType, setSelectedType] = useState<'client' | 'barber' | null>(null);

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

  const handleChoice = (type: 'client' | 'barber') => {
    setSelectedType(type);
    
    // Animação de clique (scale down/up rápido)
    const scaleRef = type === 'client' ? clientScale : barberScale;
    
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Avança para o ecrã de permissão de localização
      router.push({
        pathname: '/onboarding/location',
        params: { userType: type }
      });
    });
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
          
          {/* Título */}
          <View style={styles.header}>
            <Text style={styles.title}>Bem-vindo!</Text>
            <Text style={styles.subtitle}>Escolhe o teu perfil</Text>
          </View>

          {/* Botões de Opção */}
          <View style={styles.optionsContainer}>
            
            {/* Opção Cliente */}
            <Animated.View style={{ transform: [{ scale: clientScale }] }}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedType === 'client' && styles.optionButtonSelected
                ]}
                activeOpacity={0.9}
                onPress={() => handleChoice('client')}
              >
                <User size={44} color="#f59e0b" strokeWidth={1.5} />
                <Text style={styles.optionText}>Quero cortar cabelo</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Opção Barbeiro */}
            <Animated.View style={{ transform: [{ scale: barberScale }] }}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedType === 'barber' && styles.optionButtonSelected
                ]}
                activeOpacity={0.9}
                onPress={() => handleChoice('barber')}
              >
                <Scissors size={44} color="#f59e0b" strokeWidth={1.5} />
                <Text style={styles.optionText}>Sou barbeiro</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>
          
          {/* Indicador de progresso */}
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
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
  header: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Sora' : 'sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#a1a1aa', // Zinc-400
    fontWeight: '500',
  },
  optionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  optionButton: {
    backgroundColor: '#18181b', // Zinc-900
    borderWidth: 2,
    borderColor: '#27272a', // Zinc-800 / zinc-700 equivalent
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 128,
  },
  optionButtonSelected: {
    borderColor: '#f59e0b', // Amber-500
    backgroundColor: '#27272a', // Zinc-800
  },
  optionText: {
    color: '#FAFAFA',
    fontSize: 18,
    fontWeight: '700',
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
