import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
  ScrollView, Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { AuthService } from '../../src/services/auth';
import { UserService } from '../../src/services/users';
import { BarbershopService } from '../../src/services/barbershops';
import { useAuthStore } from '../../src/store/auth';
import { useBarberStore } from '../../src/store/barber';
import {
  User, Mail, Lock, Phone, ArrowRight, ChevronLeft,
  Scissors, UserCheck, Store, Navigation, Sparkles,
} from 'lucide-react-native';

type Role = 'client' | 'barber';
type BarberType = 'salon_owner' | 'mobile_freelancer' | 'hybrid';

// ── Componente de chip de especialidade ──────────────────────────────────────
function SpecialtyChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const SPECIALTIES = ['Cortes Clássicos', 'Degradê / Fade', 'Barba & Toalha Quente', 'Tranças', 'Coloração & Luzes', 'Sobrancelhas'];
const RADII = [2, 5, 10, 15, 20, 30];

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialRole = params.role === 'barber' ? 'barber' : 'client';

  // ── Wizard state ────────────────────────────────────────────────────────────
  const [role, setRole] = useState<Role>(initialRole);
  const [step, setStep] = useState(initialRole === 'barber' ? 2 : 1);
  const [barberType, setBarberType] = useState<BarberType | null>(null);

  // Step 3 — campos do modelo
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [shopCity, setShopCity] = useState('Luanda');
  const [coverageRadius, setCoverageRadius] = useState(5);
  const [homeServiceFee, setHomeServiceFee] = useState('1500');
  const [yearsExp, setYearsExp] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  // Step 4 — dados pessoais
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animação de transição de passo
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateStep = (next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  // Número total de passos consoante o papel
  const totalSteps = role === 'barber' ? 4 : 2;

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // ── Navegação ────────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (role === 'client') { animateStep(totalSteps); return; }
      animateStep(2);
    } else if (step === 2) {
      if (!barberType) { Alert.alert('Atenção', 'Escolhe o teu modelo de negócio.'); return; }
      animateStep(3);
    } else if (step === 3) {
      if ((barberType === 'salon_owner' || barberType === 'hybrid') && !shopName.trim()) {
        Alert.alert('Atenção', 'Insere o nome da tua barbearia.'); return;
      }
      if ((barberType === 'salon_owner' || barberType === 'hybrid') && !shopAddress.trim()) {
        Alert.alert('Atenção', 'Insere o endereço da tua barbearia.'); return;
      }
      animateStep(4);
    }
  };

  const handleBack = () => {
    if (step === 1) { router.back(); return; }
    if (step === totalSteps && role === 'client') { animateStep(1); return; }
    animateStep(step - 1);
  };

  // ── Submissão ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail || !password) {
      Alert.alert('Atenção', 'Preenche nome, email e password.'); return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A password deve ter no mínimo 6 caracteres.'); return;
    }

    setLoading(true);
    try {
      // 1. Criar conta
      await AuthService.register({ name, email: trimmedEmail, phone, password, role });

      // 2. Auto-login para obter token
      await AuthService.login(trimmedEmail, password);

      if (role === 'barber') {
        // 3. Guardar perfil do barbeiro
        await UserService.updateBarberProfile({
          barber_type: barberType || 'mobile_freelancer',
          coverage_radius_km: barberType !== 'salon_owner' ? coverageRadius : 0,
          home_service_fee: barberType !== 'salon_owner' ? Number(homeServiceFee) : 0,
          years_experience: Number(yearsExp) || 0,
          specialties: specialties.join(', '),
          bio: bio.trim(),
          is_available: true,
          onboarding_completed: true,
        });

        // 4. Criar barbearia se tiver espaço físico
        if (barberType === 'salon_owner' || barberType === 'hybrid') {
          const newShop = await BarbershopService.create({
            name: shopName.trim(),
            description: bio.trim() || 'Barbearia premium KORTA.',
            address: shopAddress.trim(),
            city: shopCity.trim() || 'Luanda',
            province: 'Luanda',
            phone: phone || '923000000',
            open_hours: 'Seg - Sáb: 08:00 às 19:00',
            latitude: -8.8383,
            longitude: 13.2344,
          });
          await useBarberStore.getState().loadShops();
          if (newShop?.id) {
            await BarbershopService.switchActiveShop(newShop.id);
          }
        }

        router.replace('/(barber)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.detail || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // ── Progress bar ──────────────────────────────────────────────────────────────
  const progress = step / totalSteps;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      {/* Header fixo */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <ChevronLeft size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>
          {role === 'barber' ? `Passo ${step} de ${totalSteps}` : 'Criar Conta'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ══ PASSO 1 — Escolha de papel ══════════════════════════════════════ */}
          {step === 1 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Bem-vindo à KORTA 👋</Text>
              <Text style={styles.stepSub}>Como queres entrar na plataforma?</Text>

              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[styles.roleCard, role === 'client' && styles.roleCardActive]}
                  onPress={() => setRole('client')} activeOpacity={0.8}
                >
                  <View style={[styles.roleIcon, role === 'client' && styles.roleIconActive]}>
                    <UserCheck size={28} color={role === 'client' ? '#000' : Colors.mutedForeground} />
                  </View>
                  <Text style={[styles.roleLabel, role === 'client' && styles.roleLabelActive]}>Sou Cliente</Text>
                  <Text style={styles.roleDesc}>Descobre e marca barbeiros</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleCard, role === 'barber' && styles.roleCardActive]}
                  onPress={() => setRole('barber')} activeOpacity={0.8}
                >
                  <View style={[styles.roleIcon, role === 'barber' && styles.roleIconActive]}>
                    <Scissors size={28} color={role === 'barber' ? '#000' : Colors.mutedForeground} />
                  </View>
                  <Text style={[styles.roleLabel, role === 'barber' && styles.roleLabelActive]}>Sou Prestador</Text>
                  <Text style={styles.roleDesc}>Gere o teu negócio</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Continuar</Text>
                <ArrowRight size={20} color="#000" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══ PASSO 2 — Modelo de negócio (só barbeiros) ══════════════════════ */}
          {step === 2 && role === 'barber' && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Qual é o teu modelo?</Text>
              <Text style={styles.stepSub}>
                Escolhe como prestas os teus serviços. Isto define o que os clientes vão ver e como o sistema te contacta.
              </Text>

              <View style={styles.modelList}>

                {/* ── Barbearia (salon_owner) ──────────────────────────────── */}
                <TouchableOpacity
                  style={[styles.modelCard, barberType === 'salon_owner' && styles.modelCardActive]}
                  onPress={() => setBarberType('salon_owner')} activeOpacity={0.85}
                >
                  <View style={styles.modelCardInner}>
                    <View style={[styles.modelIconBg, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                      <Store size={22} color="#60a5fa" strokeWidth={1.8} />
                    </View>
                    <View style={styles.modelText}>
                      <Text style={[styles.modelTitle, barberType === 'salon_owner' && styles.modelTitleActive]}>
                        Tenho uma Barbearia
                      </Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureItem}>✓  Clientes vêm ao teu espaço</Text>
                        <Text style={styles.featureItem}>✓  Agenda e horários organizados</Text>
                        <Text style={styles.featureItem}>✓  Gestão de equipa e serviços</Text>
                      </View>
                    </View>
                    {barberType === 'salon_owner' && (
                      <View style={styles.modelCheckDot} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* ── Freelancer (mobile_freelancer) ──────────────────────── */}
                <TouchableOpacity
                  style={[styles.modelCard, barberType === 'mobile_freelancer' && styles.modelCardActive]}
                  onPress={() => setBarberType('mobile_freelancer')} activeOpacity={0.85}
                >
                  <View style={styles.modelCardInner}>
                    <View style={[styles.modelIconBg, { backgroundColor: 'rgba(249,115,22,0.12)' }]}>
                      <Navigation size={22} color="#fb923c" strokeWidth={1.8} />
                    </View>
                    <View style={styles.modelText}>
                      <Text style={[styles.modelTitle, barberType === 'mobile_freelancer' && styles.modelTitleActive]}>
                        Barbeiro Independente
                      </Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureItem}>✓  Vais a casa dos clientes</Text>
                        <Text style={styles.featureItem}>✓  Define o teu raio de cobertura</Text>
                        <Text style={styles.featureItem}>✓  Taxa de deslocação personalizada</Text>
                      </View>
                    </View>
                    {barberType === 'mobile_freelancer' && (
                      <View style={styles.modelCheckDot} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* ── Híbrido ─────────────────────────────────────────────── */}
                <TouchableOpacity
                  style={[styles.modelCard, styles.modelCardHybrid, barberType === 'hybrid' && styles.modelCardActive]}
                  onPress={() => setBarberType('hybrid')} activeOpacity={0.85}
                >
                  {/* Badge Recomendado */}
                  <View style={styles.recommendedBadge}>
                    <Sparkles size={9} color="#000" strokeWidth={2.5} />
                    <Text style={styles.recommendedBadgeText}>MAIS POPULAR</Text>
                  </View>

                  <View style={[styles.modelCardInner, { marginTop: 10 }]}>
                    <View style={[styles.modelIconBg, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                      <Sparkles size={22} color="#f59e0b" strokeWidth={1.8} />
                    </View>
                    <View style={styles.modelText}>
                      <Text style={[styles.modelTitle, barberType === 'hybrid' && styles.modelTitleActive]}>
                        Híbrido — Salão + Domicílio
                      </Text>
                      <View style={styles.featureList}>
                        <Text style={styles.featureItem}>✓  Atende no salão E ao domicílio</Text>
                        <Text style={styles.featureItem}>✓  Dupla fonte de receita</Text>
                        <Text style={styles.featureItem}>✓  Mais visibilidade para clientes</Text>
                      </View>
                    </View>
                    {barberType === 'hybrid' && (
                      <View style={styles.modelCheckDot} />
                    )}
                  </View>
                </TouchableOpacity>

              </View>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Continuar</Text>
                <ArrowRight size={20} color="#000" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══ PASSO 3 — Campos dinâmicos por modelo ═══════════════════════════ */}
          {step === 3 && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Configura o teu negócio</Text>
              <Text style={styles.stepSub}>
                {barberType === 'salon_owner' && 'Dados do teu espaço físico.'}
                {barberType === 'mobile_freelancer' && 'Define a tua área e taxa de deslocação.'}
                {barberType === 'hybrid' && 'Dados do espaço e configuração domiciliar.'}
              </Text>

              {/* Campos de espaço físico */}
              {(barberType === 'salon_owner' || barberType === 'hybrid') && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Store size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Espaço Físico</Text>
                  </View>

                  <TextInput
                    style={styles.inputField}
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="Nome da Barbearia / Salão *"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={shopAddress}
                    onChangeText={setShopAddress}
                    placeholder="Endereço completo *"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                  <TextInput
                    style={styles.inputField}
                    value={shopCity}
                    onChangeText={setShopCity}
                    placeholder="Cidade"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
              )}

              {/* Campos de serviço ao domicílio */}
              {(barberType === 'mobile_freelancer' || barberType === 'hybrid') && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Navigation size={16} color={Colors.primary} />
                    <Text style={styles.sectionTitle}>Serviço ao Domicílio</Text>
                  </View>

                  <TextInput
                    style={styles.inputField}
                    value={homeServiceFee}
                    onChangeText={setHomeServiceFee}
                    placeholder="Taxa de deslocação (Kz)"
                    placeholderTextColor={Colors.mutedForeground}
                    keyboardType="numeric"
                  />

                  <Text style={styles.fieldLabel}>Raio de cobertura: {coverageRadius} km</Text>
                  <View style={styles.radiusRow}>
                    {RADII.map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.radiusChip, coverageRadius === r && styles.radiusChipActive]}
                        onPress={() => setCoverageRadius(r)}
                      >
                        <Text style={[styles.radiusChipText, coverageRadius === r && styles.radiusChipTextActive]}>
                          {r} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Perfil profissional — comum a todos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={16} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Perfil Profissional</Text>
                </View>

                <TextInput
                  style={styles.inputField}
                  value={yearsExp}
                  onChangeText={setYearsExp}
                  placeholder="Anos de experiência"
                  placeholderTextColor={Colors.mutedForeground}
                  keyboardType="numeric"
                />

                <Text style={styles.fieldLabel}>Especialidades</Text>
                <View style={styles.chipRow}>
                  {SPECIALTIES.map(s => (
                    <SpecialtyChip key={s} label={s} selected={specialties.includes(s)} onPress={() => toggleSpecialty(s)} />
                  ))}
                </View>

                <TextInput
                  style={[styles.inputField, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Biografia curta (opcional)"
                  placeholderTextColor={Colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                <Text style={styles.nextBtnText}>Continuar</Text>
                <ArrowRight size={20} color="#000" />
              </TouchableOpacity>
            </View>
          )}

          {/* ══ PASSO 4 (ou 2 para clientes) — Dados pessoais ══════════════════ */}
          {step === totalSteps && (
            <View style={styles.stepWrap}>
              <Text style={styles.stepTitle}>Quase lá! 🎉</Text>
              <Text style={styles.stepSub}>Cria as tuas credenciais de acesso.</Text>

              <View style={styles.form}>
                <View style={styles.inputRow}>
                  <User size={18} color={Colors.mutedForeground} />
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
                <View style={styles.inputRow}>
                  <Mail size={18} color={Colors.mutedForeground} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    placeholderTextColor={Colors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Phone size={18} color={Colors.mutedForeground} />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Telefone (opcional)"
                    placeholderTextColor={Colors.mutedForeground}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.inputRow}>
                  <Lock size={18} color={Colors.mutedForeground} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password (mín. 6 caracteres)"
                    placeholderTextColor={Colors.mutedForeground}
                    secureTextEntry
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {role === 'barber' ? 'Criar Conta e Entrar' : 'Criar Conta'}
                    </Text>
                    <ArrowRight size={20} color="#000" />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.loginHint}>
                <Text style={styles.loginHintText}>Já tens conta? </Text>
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                  <Text style={styles.loginHintLink}>Fazer login</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  topBarTitle: { fontSize: 14, color: Colors.mutedForeground, fontWeight: '600' },

  progressTrack: { height: 3, backgroundColor: Colors.surface2, marginHorizontal: Spacing.md, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },

  scrollContent: { padding: Spacing.xl, paddingBottom: 60 },
  stepWrap: { gap: Spacing.lg },

  stepTitle: { fontSize: 26, fontWeight: '900', color: Colors.foreground, letterSpacing: 0.3 },
  stepSub: { fontSize: 14, color: Colors.mutedForeground, lineHeight: 20, marginTop: -Spacing.sm },

  // Passo 1 — Role
  roleRow: { flexDirection: 'row', gap: Spacing.md },
  roleCard: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface, gap: Spacing.sm,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: 'rgba(245,158,11,0.08)' },
  roleIcon: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.surface2, alignItems: 'center', justifyContent: 'center',
  },
  roleIconActive: { backgroundColor: Colors.primary },
  roleLabel: { fontSize: 15, fontWeight: '800', color: Colors.foreground, textAlign: 'center' },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.mutedForeground, textAlign: 'center' },

  // Passo 2 — Modelo (Premium)
  modelList: { gap: Spacing.md },
  modelCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  modelCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  modelCardHybrid: {
    borderColor: 'rgba(245,158,11,0.3)',
    backgroundColor: 'rgba(245,158,11,0.04)',
  },
  modelCardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  modelIconBg: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modelText: { flex: 1 },
  modelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.foreground,
    marginBottom: 8,
  },
  modelTitleActive: { color: Colors.primary },
  featureList: { gap: 4 },
  featureItem: {
    fontSize: 12,
    color: Colors.mutedForeground,
    lineHeight: 18,
    fontWeight: '500',
  },
  modelCheckDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    flexShrink: 0,
    marginTop: 2,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Passo 3 — Campos
  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, gap: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.foreground },
  fieldLabel: { fontSize: 13, color: Colors.mutedForeground, fontWeight: '600' },

  inputField: {
    backgroundColor: Colors.surface2, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    color: Colors.foreground, fontSize: 15,
  },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: Spacing.md },

  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  radiusChip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  radiusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  radiusChipText: { color: Colors.mutedForeground, fontSize: 13, fontWeight: '600' },
  radiusChipTextActive: { color: '#000', fontWeight: '800' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.mutedForeground, fontSize: 13 },
  chipTextSelected: { color: '#000', fontWeight: '700' },

  // Passo 4 — Dados pessoais
  form: { gap: Spacing.md },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 58,
  },
  input: { flex: 1, fontSize: 15, color: Colors.foreground },

  // Botões
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, height: 58, borderRadius: Radius.md,
    gap: Spacing.sm, marginTop: Spacing.sm, ...Shadows.gold,
  },
  nextBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.primary, height: 58, borderRadius: Radius.md,
    gap: Spacing.sm, marginTop: Spacing.sm, ...Shadows.gold,
  },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },

  loginHint: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  loginHintText: { color: Colors.mutedForeground, fontSize: 14 },
  loginHintLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
