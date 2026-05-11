import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import api from '../../src/api/client';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react-native';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function CreateBooking() {
  const { barbershopId, serviceId, serviceName, price } = useLocalSearchParams();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!selectedTime) {
      Alert.alert('Erro', 'Por favor, seleciona um horário.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        barbershop_id: Number(barbershopId),
        service_id: Number(serviceId),
        date: selectedDate,
        time_slot: selectedTime,
        notes: ""
      });
      setSuccess(true);
    } catch (error: any) {
      Alert.alert('Erro no Agendamento', error.response?.data?.detail || 'Não foi possível completar a reserva.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <CheckCircle2 size={80} color={Colors.success} />
        <Text style={styles.successTitle}>Reserva Confirmada!</Text>
        <Text style={styles.successSubtitle}>
          O teu corte para {serviceName} foi agendado com sucesso.
        </Text>
        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          <Text style={styles.doneButtonText}>Ver Minhas Marcações</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Reserva</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Resumo do Serviço */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Serviço Selecionado</Text>
          <Text style={styles.serviceName}>{serviceName}</Text>
          <Text style={styles.servicePrice}>
            {Number(price).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </Text>
        </View>

        {/* Seleção de Data (Simples para MVP) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CalendarIcon size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Escolha o Dia</Text>
          </View>
          <Text style={styles.dateText}>{selectedDate}</Text>
        </View>

        {/* Seleção de Horário */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Escolha o Horário</Text>
          </View>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  selectedTime === slot && styles.timeSlotSelected
                ]}
                onPress={() => setSelectedTime(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  selectedTime === slot && styles.timeSlotTextSelected
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.confirmButton, !selectedTime && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={loading || !selectedTime}
        >
          {loading ? (
            <ActivityIndicator color={Colors.primaryForeground} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    letterSpacing: 0.5,
  },
  content: {
    padding: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  summaryLabel: {
    color: Colors.mutedForeground,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  serviceName: {
    color: Colors.foreground,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },
  servicePrice: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '800',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    ...Shadows.elegant,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    height: 54,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeSlotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.foreground,
  },
  timeSlotTextSelected: {
    color: Colors.primaryForeground,
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    height: 64,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.gold,
  },
  confirmButtonDisabled: {
    opacity: 0.3,
  },
  confirmButtonText: {
    color: Colors.primaryForeground,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.primary,
    marginTop: Spacing.xl,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.mutedForeground,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 26,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 18,
    borderRadius: Radius.lg,
    marginTop: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
    ...Shadows.gold,
  },
  doneButtonText: {
    color: Colors.primaryForeground,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
