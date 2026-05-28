import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing, Radius, Shadows } from '../../src/theme';
import { Check, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
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

  // Calculate prices
  const finalPrice = totalPrice ? Number(totalPrice) : 500;
  const finalServiceName = serviceName || 'Corte cabelo';
  const finalBarberName = barberName || 'Kuyuyu Barber';

  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Animated values for checkmark scale
  const checkScaleCash = useRef(new Animated.Value(0)).current;
  const checkScaleMobile = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selectedMethod === 'cash') {
      Animated.spring(checkScaleCash, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    } else {
      checkScaleCash.setValue(0);
    }

    if (selectedMethod === 'mobile_money') {
      Animated.spring(checkScaleMobile, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    } else {
      checkScaleMobile.setValue(0);
    }
  }, [selectedMethod]);

  const handlePay = async () => {
    if (!selectedMethod) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      router.push({
        pathname: '/booking/rating',
        params: {
          serviceId,
          serviceName: finalServiceName,
          barberName: finalBarberName,
          barberRating
        }
      });
    }, 1500);
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
          <Text style={styles.headerTitle}>Pagamento</Text>
          <Text style={styles.headerSubtitle}>Escolha o método</Text>
        </View>

        <View style={styles.content}>
          {/* Total Price Section */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total a pagar:</Text>
            <Text style={styles.amountValue}>{finalPrice.toLocaleString('pt-AO')} Kz</Text>
          </View>

          {/* Methods List */}
          <View style={styles.methodsList}>
            {/* Method 1: Dinheiro */}
            <Pressable
              style={({ pressed }) => [
                styles.methodCard,
                selectedMethod === 'cash' && styles.methodCardSelected,
                pressed && { opacity: 0.9 }
              ]}
              onPress={() => setSelectedMethod('cash')}
            >
              <View style={styles.methodLeft}>
                <Text style={styles.methodIcon}>💵</Text>
                <Text style={styles.methodName}>Dinheiro</Text>
              </View>
              {selectedMethod === 'cash' ? (
                <Animated.View style={[styles.checkmarkCircle, { transform: [{ scale: checkScaleCash }] }]}>
                  <Check size={12} color="#000" strokeWidth={3} />
                </Animated.View>
              ) : (
                <View style={styles.emptyCheck} />
              )}
            </Pressable>

            {/* Method 2: Mobile Money */}
            <Pressable
              style={({ pressed }) => [
                styles.methodCard,
                selectedMethod === 'mobile_money' && styles.methodCardSelected,
                pressed && { opacity: 0.9 }
              ]}
              onPress={() => setSelectedMethod('mobile_money')}
            >
              <View style={styles.methodLeft}>
                <Text style={styles.methodIcon}>📱</Text>
                <Text style={styles.methodName}>Mobile Money</Text>
              </View>
              {selectedMethod === 'mobile_money' ? (
                <Animated.View style={[styles.checkmarkCircle, { transform: [{ scale: checkScaleMobile }] }]}>
                  <Check size={12} color="#000" strokeWidth={3} />
                </Animated.View>
              ) : (
                <View style={styles.emptyCheck} />
              )}
            </Pressable>

            {/* Method 3: Carteira Korta (Disabled) */}
            <View style={[styles.methodCard, styles.methodCardDisabled]}>
              <View style={styles.methodLeft}>
                <Text style={styles.methodIcon}>👛</Text>
                <View style={styles.disabledTextCol}>
                  <Text style={[styles.methodName, { color: '#71717a' }]}>Carteira Korta</Text>
                  <Text style={styles.soonText}>Em breve</Text>
                </View>
              </View>
              <View style={styles.crossCircle}>
                <X size={12} color="#71717a" strokeWidth={3} />
              </View>
            </View>
          </View>
        </View>

        {/* Action Button Footer */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.payButton,
              (!selectedMethod || processing) && styles.payButtonDisabled,
              selectedMethod && !processing && pressed && { opacity: 0.9 },
              selectedMethod && !processing && Shadows.gold
            ]}
            onPress={handlePay}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[
                styles.payButtonText,
                !selectedMethod && { color: '#71717a' }
              ]}>
                Confirmar pagamento
              </Text>
            )}
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
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    gap: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#71717a',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    gap: Spacing.xl,
  },
  amountSection: {
    alignItems: 'center',
    gap: 6,
  },
  amountLabel: {
    fontSize: 14,
    color: '#a1a1aa',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f59e0b',
  },
  methodsList: {
    gap: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181B',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  methodCardSelected: {
    borderColor: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  methodCardDisabled: {
    opacity: 0.5,
    borderColor: '#1c1c1e',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disabledTextCol: {
    gap: 2,
  },
  soonText: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  checkmarkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3f3f46',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#000000',
  },
  payButton: {
    backgroundColor: '#f59e0b',
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#27272A',
  },
  payButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
