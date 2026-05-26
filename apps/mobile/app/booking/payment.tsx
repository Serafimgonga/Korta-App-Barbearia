import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { Banknote, Smartphone, CheckCircle2 } from 'lucide-react-native';

export default function Payment() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const methods = [
    { id: 'cash', label: 'Dinheiro', icon: '💵', description: 'Pagamento à chegada' },
    { id: 'mobile_money', label: 'Mobile Money', icon: '📱', description: 'MEO, Unitel, Africell' },
    { id: 'card', label: 'Cartão (futuro)', icon: '💳', description: 'Em breve disponível', disabled: true },
  ];

  const handlePay = async () => {
    if (!selectedMethod) {
      Alert.alert('Erro', 'Por favor, seleciona um método de pagamento.');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      router.push({ pathname: '/booking/rating', params: { bookingId } });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirma o Pagamento</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Valor a pagar</Text>
          <Text style={styles.amount}>4 000 Kz</Text>
          <Text style={styles.small}>Corte + Barba (João Mbala)</Text>
        </View>

        <Text style={styles.methodsLabel}>Método de Pagamento</Text>
        <View style={styles.methodsList}>
          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected, method.disabled && styles.methodDisabled]}
              onPress={() => !method.disabled && setSelectedMethod(method.id)}
              disabled={method.disabled}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.label}</Text>
                <Text style={styles.methodDesc}>{method.description}</Text>
              </View>
              {selectedMethod === method.id && !method.disabled && (
                <View style={styles.checkmark}>
                  <CheckCircle2 size={20} color={Colors.primary} fill={Colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Dica</Text>
          <Text style={styles.infoText}>Mobile Money é o método mais rápido e seguro em Angola. Nenhum dado bancário é partilhado com o barbeiro.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, !selectedMethod && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!selectedMethod || processing}
        >
          {processing ? (
            <ActivityIndicator color={Colors.primaryForeground} />
          ) : (
            <Text style={styles.payButtonText}>Confirmar Pagamento</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: Colors.foreground },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: Colors.mutedForeground, textTransform: 'uppercase' },
  amount: { fontSize: 32, fontWeight: '900', color: Colors.primary, marginTop: 8 },
  small: { fontSize: 12, color: Colors.mutedForeground, marginTop: 6 },
  methodsLabel: { fontSize: 12, fontWeight: '800', color: Colors.foreground, marginTop: Spacing.lg },
  methodsList: { gap: Spacing.md },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  methodCardSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(212, 175, 55, 0.08)' },
  methodDisabled: { opacity: 0.5 },
  methodIcon: { fontSize: 24 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 14, fontWeight: '800', color: Colors.foreground },
  methodDesc: { fontSize: 12, color: Colors.mutedForeground, marginTop: 2 },
  checkmark: { marginLeft: 'auto' },
  infoBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: Colors.foreground },
  infoText: { fontSize: 12, color: Colors.mutedForeground, marginTop: 6, lineHeight: 18 },
  footer: { padding: Spacing.lg },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
    ...Shadows.gold,
  },
  payButtonDisabled: { opacity: 0.3 },
  payButtonText: { color: Colors.primaryForeground, fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
});
