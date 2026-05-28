import React, { useRef, useEffect, useState } from 'react';
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
import { ChevronLeft, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const SERVICES = [
  { id: '1', name: 'Corte cabelo', duration: '15 min', price: 500, icon: '✂️' },
  { id: '2', name: 'Barba', duration: '10 min', price: 300, icon: '🧴' },
  { id: '3', name: 'Kit completo', duration: '30 min', price: 800, icon: '✨' },
];

function ServiceCard({ item, onPress, index }: { item: typeof SERVICES[0]; onPress: () => void; index: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(45)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
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
          styles.serviceCard,
          (pressed || isHovered) && styles.serviceCardActive
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{item.icon}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Clock size={12} color="#71717a" />
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.priceValue}>{item.price.toLocaleString('pt-AO')}</Text>
          <Text style={styles.priceCurrency}>Kz</Text>
        </View>

        {/* Chevron */}
        <ChevronLeft size={18} color="#3f3f46" style={{ transform: [{ rotate: '180deg' }] }} />
      </Pressable>
    </Animated.View>
  );
}

export default function SelectService() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { lat, lng } = params as any;

  const handleSelect = (service: typeof SERVICES[0]) => {
    router.push({
      pathname: '/booking/select-mode',
      params: {
        lat,
        lng,
        serviceId: service.id,
        serviceName: service.name,
        price: String(service.price),
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
          <Text style={styles.headerTitle}>Escolher serviço</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.servicesList}>
            {SERVICES.map((item, index) => (
              <ServiceCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => handleSelect(item)}
              />
            ))}
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
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  servicesList: {
    gap: Spacing.sm + 2,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.md,
    gap: 14,
  },
  serviceCardActive: {
    borderColor: '#f59e0b',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  durationText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f59e0b',
  },
  priceCurrency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a1a1aa',
  },
});
