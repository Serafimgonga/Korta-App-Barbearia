import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { AuthService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/auth';
import { Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { role } = params as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animações de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      Alert.alert('Campos em falta', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.login(trimmedEmail, password);
      const user = useAuthStore.getState().user;
      if (user?.role === 'barber') {
        router.replace('/(barber)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Falha no Login', error.response?.data?.detail || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const canGoBack = router.canGoBack();

  return (
    <LinearGradient
      colors={['#000000', '#18181b']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Header com botão voltar */}
        <View style={styles.header}>
          {canGoBack ? (
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#f59e0b" />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Título */}
            <View style={styles.titleSection}>
              {/* Badge de role — só aparece quando vem do onboarding com role definido */}
              {role ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {role === 'barber' ? '✂️  BARBEIRO' : '👤  CLIENTE'}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.title}>Bem-vindo{'\n'}de volta</Text>
              <Text style={styles.subtitle}>
                {role === 'barber'
                  ? 'Faz login para continuares a receber pedidos.'
                  : role === 'client'
                  ? 'Faz login para continuares a marcar os teus cortes.'
                  : 'Faz login na tua conta KORTA.'}
              </Text>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#71717a" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#52525b"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color="#71717a" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                  placeholderTextColor="#52525b"
                />
              </View>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled, Shadows.gold]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Entrar</Text>
                    <ArrowRight size={20} color="#000000" strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tens uma conta? </Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/register', params: { role } })}>
                <Text style={styles.registerLink}>Cria uma aqui</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: '#18181b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272a',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: 32,
  },
  titleSection: {
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FAFAFA',
    letterSpacing: -0.5,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: 15,
    color: '#a1a1aa',
    lineHeight: 22,
    fontWeight: '500',
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: '#27272a',
    paddingHorizontal: Spacing.md,
    height: 60,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FAFAFA',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#f59e0b',
    height: 60,
    borderRadius: Radius.full,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#71717a',
    fontSize: 14,
  },
  registerLink: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '700',
  },
});
