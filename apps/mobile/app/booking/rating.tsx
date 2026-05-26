import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { Star } from 'lucide-react-native';

export default function Rating() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simular envio de avaliação
    setTimeout(() => {
      setSubmitting(false);
      router.replace('/(tabs)/bookings');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Como foi o atendimento?</Text>
        <Text style={styles.subtitle}>A tua avaliação ajuda a melhorar a KORTA</Text>
      </View>

      <View style={styles.content}>
        {/* Rating stars */}
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Star
                  size={48}
                  color={star <= rating ? Colors.primary : Colors.border}
                  fill={star <= rating ? Colors.primary : 'transparent'}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0
              ? 'Toca para avaliar'
              : rating === 1
              ? 'Poderia melhorar'
              : rating === 2
              ? 'Razoável'
              : rating === 3
              ? 'Bom'
              : rating === 4
              ? 'Muito bom'
              : 'Excelente!'}
          </Text>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.label}>Deixa um comentário (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Partilha detalhes sobre a experiência..."
            placeholderTextColor={Colors.mutedForeground}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        {/* Tips */}
        {rating >= 4 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsEmoji}>🙌</Text>
            <Text style={styles.tipsText}>Obrigado! Avaliações positivas ajudam o barbeiro a receber mais clientes.</Text>
          </View>
        )}
        {rating > 0 && rating < 4 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsEmoji}>💬</Text>
            <Text style={styles.tipsText}>O teu feedback é valioso! Ajuda-nos a melhorar o serviço.</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.primaryForeground} />
          ) : (
            <Text style={styles.submitText}>Enviar Avaliação</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: Spacing.lg, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: Colors.foreground, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.mutedForeground, marginTop: Spacing.sm, textAlign: 'center' },
  content: { flex: 1, padding: Spacing.lg, gap: Spacing.xl },
  ratingSection: { alignItems: 'center', gap: Spacing.lg },
  starsContainer: { flexDirection: 'row', gap: Spacing.md },
  starButton: { padding: 4 },
  ratingText: { fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center', minHeight: 24 },
  commentSection: { gap: Spacing.sm },
  label: { fontSize: 12, fontWeight: '800', color: Colors.foreground },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.foreground,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tipsCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipsEmoji: { fontSize: 28 },
  tipsText: { fontSize: 13, color: Colors.foreground, textAlign: 'center', fontWeight: '600' },
  footer: { padding: Spacing.lg },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    alignItems: 'center',
    ...Shadows.gold,
  },
  submitButtonDisabled: { opacity: 0.3 },
  submitText: { color: Colors.primaryForeground, fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
});
