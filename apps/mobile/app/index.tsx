import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../src/theme';
import { Scissors } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Scissors size={80} color={Colors.primary} strokeWidth={1} />
          <Text style={styles.title}>KORTA</Text>
          <Text style={styles.subtitle}>URBAN PREMIUM GROOMING</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, Shadows.gold]}
            activeOpacity={0.8}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Começar Agora</Text>
          </TouchableOpacity>
          
          <Text style={styles.version}>v1.0.0 — Ícolo e Bengo, Angola 🇦🇴</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  title: {
    fontSize: 56,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 8,
    marginTop: Spacing.md,
    fontFamily: Platform.OS === 'ios' ? 'Sora' : 'sans-serif',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
    letterSpacing: 4,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 64,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.primaryForeground,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  version: {
    marginTop: Spacing.xl,
    color: Colors.mutedForeground,
    fontSize: 11,
    letterSpacing: 1,
  }
});
