import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Spacing, Radius, Shadows } from '../../src/theme';
import { Star } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function Rating() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { serviceName, barberName } = params as any;

  const finalBarberName = barberName || 'Kuyuyu Barber';

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Array of 5 animated scales for stars
  const starScales = useRef(
    Array(5).fill(0).map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStarPress = (index: number) => {
    setRating(index);
    // Animate the selected star and its predecessors
    const animations = starScales.map((scale, i) => {
      if (i < index) {
        return Animated.sequence([
          Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1.0, friction: 4, useNativeDriver: true })
        ]);
      }
      return Animated.timing(scale, { toValue: 1.0, duration: 100, useNativeDriver: true });
    });
    Animated.parallel(animations).start();
  };

  const handleFinish = (skipped = false) => {
    setSubmitting(true);
    // Simulate API call to save rating
    setTimeout(() => {
      setSubmitting(false);
      // Clean and reset routing back to ClientHome
      router.dismissAll();
      router.replace('/(tabs)');
    }, 1200);
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
          <Text style={styles.headerTitle}>Avaliar serviço</Text>
          <Text style={styles.headerSubtitle}>Como foi a experiência?</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              
              {/* Barber Details */}
              <View style={styles.barberSection}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>🧔</Text>
                </View>
                <Text style={styles.barberName}>{finalBarberName}</Text>
              </View>

              {/* Star Rating Selection */}
              <View style={styles.ratingSection}>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((index) => {
                    const activeRating = hoveredRating !== null ? hoveredRating : rating;
                    const isStarred = index <= activeRating;
                    const starColor = isStarred ? '#f59e0b' : '#3f3f46';

                    return (
                      <Animated.View
                        key={index}
                        style={{ transform: [{ scale: starScales[index - 1] }] }}
                      >
                        <Pressable
                          onPress={() => handleStarPress(index)}
                          // @ts-ignore - Web hover events support
                          onHoverIn={Platform.OS === 'web' ? () => setHoveredRating(index) : undefined}
                          onHoverOut={Platform.OS === 'web' ? () => setHoveredRating(null) : undefined}
                          style={styles.starButton}
                        >
                          <Star
                            size={38}
                            color={starColor}
                            fill={isStarred ? '#f59e0b' : 'transparent'}
                            strokeWidth={1.5}
                          />
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>

              {/* Comment text area */}
              <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>Comentário (opcional):</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Excelente serviço!"
                  placeholderTextColor="#71717a"
                  keyboardAppearance="dark"
                  textAlignVertical="top"
                />
              </View>

            </Animated.View>
          </ScrollView>

          {/* Action buttons footer */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                rating < 1 && styles.submitButtonDisabled,
                rating >= 1 && !submitting && pressed && { opacity: 0.9 },
                rating >= 1 && !submitting && Shadows.gold
              ]}
              onPress={() => handleFinish(false)}
              disabled={rating < 1 || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={[
                  styles.submitButtonText,
                  rating < 1 && { color: '#71717a' }
                ]}>
                  Enviar avaliação
                </Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.skipButton,
                pressed && { opacity: 0.7 }
              ]}
              onPress={() => handleFinish(true)}
              disabled={submitting}
            >
              <Text style={styles.skipButtonText}>Pular</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  content: {
    gap: Spacing.xl + 4,
  },
  barberSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  avatarText: {
    fontSize: 36,
  },
  barberName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ratingSection: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starButton: {
    padding: 4,
  },
  commentSection: {
    gap: 8,
  },
  commentLabel: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    color: '#FFFFFF',
    fontSize: 14,
    height: 100,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    backgroundColor: '#000000',
    gap: 10,
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#27272A',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
  skipButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    color: '#71717a',
    fontSize: 14,
    fontWeight: '700',
  },
});
