import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Animated,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Spacing, Radius } from '../../src/theme';
import { ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

function ModeCard({ icon, title, subtitle, onPress, index }: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: isHovered ? 1.02 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{
      flex: 1,
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
    }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        // @ts-ignore - Web-only props
        onHoverIn={Platform.OS === 'web' ? handleHoverIn : undefined}
        onHoverOut={Platform.OS === 'web' ? handleHoverOut : undefined}
        style={({ pressed }) => [
          styles.modeCard,
          (pressed || isHovered) && styles.modeCardActive
        ]}
      >
        <Text style={styles.modeIcon}>{icon}</Text>
        <Text style={styles.modeTitle}>{title}</Text>
        <Text style={styles.modeSubtitle}>{subtitle}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function SelectMode() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lat, lng, serviceId, serviceName, price } = params as any;

  const handleSelect = (mode: 'home' | 'salon') => {
    router.push({
      pathname: '/booking/select-barber',
      params: {
        lat,
        lng,
        serviceId,
        serviceName,
        price,
        mode,
        deliveryFee: mode === 'home' ? '1000' : '0',
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
          <Text style={styles.headerTitle}>Escolher modo</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Cards */}
        <View style={styles.content}>
          <View style={styles.cardsRow}>
            <ModeCard
              icon="🏠"
              title="Vem até mim"
              subtitle="(Barbeiro vai à casa)"
              onPress={() => handleSelect('home')}
              index={0}
            />
            <ModeCard
              icon="🏪"
              title="Vou ao barbeiro"
              subtitle="(Visitar o salão)"
              onPress={() => handleSelect('salon')}
              index={1}
            />
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modeCardActive: {
    borderColor: '#f59e0b',
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 4,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#71717a',
    textAlign: 'center',
    fontWeight: '500',
  },
});
