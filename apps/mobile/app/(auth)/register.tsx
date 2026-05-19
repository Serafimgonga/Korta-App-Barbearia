import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { AuthService } from '../../src/services/auth';
import { User, Mail, Lock, Phone, ArrowRight, ChevronLeft, Scissors, UserCheck } from 'lucide-react-native';

type Role = 'client' | 'barber';

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A password deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({ name, email, phone, password, role });
      const roleLabel = role === 'barber' ? 'de barbeiro' : 'de cliente';
      Alert.alert(
        '✅ Conta criada!',
        `A tua conta ${roleLabel} foi criada com sucesso. Podes fazer login agora.`,
        [{ text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Erro no Registo', error.response?.data?.detail || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.primary} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Cria a tua conta</Text>
          <Text style={styles.subtitle}>
            Junta-te à KORTA. Escolhe como queres entrar na plataforma.
          </Text>
        </View>

        {/* Seletor de Role */}
        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[styles.roleOption, role === 'client' && styles.roleOptionActive]}
            onPress={() => setRole('client')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconWrap, role === 'client' && styles.roleIconWrapActive]}>
              <UserCheck size={28} color={role === 'client' ? Colors.primaryForeground : Colors.mutedForeground} />
            </View>
            <Text style={[styles.roleLabel, role === 'client' && styles.roleLabelActive]}>
              Sou Cliente
            </Text>
            <Text style={[styles.roleDesc, role === 'client' && styles.roleDescActive]}>
              Descobre e marca barbearias
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleOption, role === 'barber' && styles.roleOptionActive]}
            onPress={() => setRole('barber')}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconWrap, role === 'barber' && styles.roleIconWrapActive]}>
              <Scissors size={28} color={role === 'barber' ? Colors.primaryForeground : Colors.mutedForeground} />
            </View>
            <Text style={[styles.roleLabel, role === 'barber' && styles.roleLabelActive]}>
              Sou Barbeiro
            </Text>
            <Text style={[styles.roleDesc, role === 'barber' && styles.roleDescActive]}>
              Gere a tua barbearia
            </Text>
          </TouchableOpacity>
        </View>

        {role === 'barber' && (
          <View style={styles.barberNotice}>
            <Scissors size={14} color={Colors.primary} />
            <Text style={styles.barberNoticeText}>
              Após o registo, poderás criar e gerir a tua barbearia no painel exclusivo de barbeiros.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color={Colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              placeholder="Nome Completo"
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={Colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              placeholder="Telefone (Opcional)"
              value={phone}
              onChangeText={setPhone}
              style={styles.input}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              placeholder="Password (mín. 6 caracteres)"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <>
                <Text style={styles.registerButtonText}>
                  {role === 'barber' ? 'Criar Conta de Barbeiro' : 'Criar Conta'}
                </Text>
                <ArrowRight size={20} color={Colors.primaryForeground} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tens uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Faz login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  backButton: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: Spacing.lg, marginLeft: -Spacing.xs,
  },
  backButtonText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  header: { marginBottom: Spacing.xl },
  title: { fontSize: 34, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 15, color: Colors.mutedForeground, marginTop: Spacing.sm, lineHeight: 22 },

  // Role Selector
  roleSelector: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  roleOption: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.accent },
  roleIconWrap: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.surface2, justifyContent: 'center',
    alignItems: 'center', marginBottom: Spacing.sm,
  },
  roleIconWrapActive: { backgroundColor: Colors.primary },
  roleLabel: { fontSize: 15, fontWeight: '800', color: Colors.foreground, textAlign: 'center' },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.mutedForeground, textAlign: 'center', marginTop: 2 },
  roleDescActive: { color: Colors.accentForeground },

  barberNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.accent, borderRadius: Radius.md,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  barberNoticeText: { flex: 1, fontSize: 13, color: Colors.accentForeground, lineHeight: 18 },

  form: { gap: Spacing.md },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, height: 60,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: 16, color: Colors.foreground },
  registerButton: {
    backgroundColor: Colors.primary, height: 60, borderRadius: Radius.md,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: Spacing.md, gap: Spacing.sm, ...Shadows.gold,
  },
  registerButtonText: { color: Colors.primaryForeground, fontSize: 17, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.xl },
  footerText: { color: Colors.mutedForeground, fontSize: 14 },
  loginLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
