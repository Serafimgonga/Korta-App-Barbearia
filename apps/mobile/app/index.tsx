import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius } from '../src/theme';
import { Scissors } from 'lucide-react-native';

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Scissors size={64} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.title}>KORTA</Text>
          <Text style={styles.subtitle}>Barbearia na ponta dos dedos</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
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
    fontSize: 42,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 4,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    height: 56,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: Colors.textOnPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  version: {
    marginTop: Spacing.lg,
    color: Colors.textSecondary,
    fontSize: 12,
  }
});
