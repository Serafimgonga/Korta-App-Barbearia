import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { Scissors, MapPin, Navigation, Award, CheckCircle, ChevronRight, ChevronLeft, DollarSign } from 'lucide-react-native';
import { UserService } from '../services/users';
import { BarbershopService } from '../services/barbershops';
import { useBarberStore } from '../store/barber';

interface BarberOnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

export default function BarberOnboardingModal({ visible, onComplete }: BarberOnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [barberType, setBarberType] = useState<'salon_owner' | 'mobile_freelancer' | 'hybrid' | null>(null);
  
  // Mobile / Freelancer options
  const [coverageRadius, setCoverageRadius] = useState<number>(5);
  const [homeServiceFee, setHomeServiceFee] = useState<string>('1500');

  // Salon options
  const [shopName, setShopName] = useState<string>('');
  const [shopAddress, setShopAddress] = useState<string>('');

  // General profile options
  const [yearsExperience, setYearsExperience] = useState<string>('2');
  const [bio, setBio] = useState<string>('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const specialtiesOptions = ['Cortes Clássicos', 'Degradê / Fade', 'Barba & Toalha Quente', 'Tranças', 'Coloração & Luzes', 'Sobrancelhas', 'Alisamento'];

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter(s => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!barberType) {
        Alert.alert('Aviso', 'Por favor, selecione um modelo de negócio.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (barberType === 'salon_owner' || barberType === 'hybrid') {
        if (!shopName.trim()) {
          Alert.alert('Aviso', 'Por favor, insira o nome da sua barbearia.');
          return;
        }
        if (!shopAddress.trim()) {
          Alert.alert('Aviso', 'Por favor, insira o endereço da sua barbearia.');
          return;
        }
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Atualizar Perfil do Barbeiro
      await UserService.updateBarberProfile({
        barber_type: barberType || 'freelancer',
        coverage_radius_km: Number(coverageRadius),
        home_service_fee: barberType === 'salon_owner' ? 0 : Number(homeServiceFee || 0),
        years_experience: Number(yearsExperience || 0),
        specialties: selectedSpecialties.join(', '),
        bio: bio.trim(),
        onboarding_completed: true,
        is_available: true,
      });

      // 2. Se for Dono de Barbearia ou Híbrido, criar a barbearia ativa automaticamente
      if (barberType === 'salon_owner' || barberType === 'hybrid') {
        const newShop = await BarbershopService.create({
          name: shopName.trim(),
          description: bio.trim() || `Barbearia Premium de atendimento personalizado.`,
          address: shopAddress.trim(),
          city: 'Luanda',
          province: 'Luanda',
          phone: '923000000',
          open_hours: 'Seg - Sáb: 08:00 às 19:00',
          latitude: -8.8383,
          longitude: 13.2344,
        });

        // Carregar lojas e selecionar a nova
        await useBarberStore.getState().loadShops();
        if (newShop && newShop.id) {
          await BarbershopService.switchActiveShop(newShop.id);
        }
      }

      Alert.alert('Sucesso', 'Perfil KORTA PRO configurado com sucesso!', [
        { text: 'Excelente!', onPress: onComplete }
      ]);
    } catch (error: any) {
      console.error('Erro ao salvar onboarding do barbeiro:', error);
      Alert.alert('Erro', error.response?.data?.detail || 'Não foi possível salvar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>KORTA PRO</Text>
          <Text style={styles.headerStep}>Passo {step} de 3</Text>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Qual é o seu Modelo de Negócio?</Text>
              <Text style={styles.stepSubtitle}>
                Diferencie a sua experiência na plataforma para que possamos apresentar os melhores clientes para si.
              </Text>

              <View style={styles.optionsList}>
                {/* Salon Owner */}
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    barberType === 'salon_owner' && styles.optionCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setBarberType('salon_owner')}
                >
                  <View style={styles.cardHeader}>
                    <Scissors size={24} color={barberType === 'salon_owner' ? '#fff' : '#f59e0b'} />
                    <Text style={[styles.cardTitle, barberType === 'salon_owner' && styles.textWhite]}>
                      Dono de Barbearia / Salão
                    </Text>
                  </View>
                  <Text style={[styles.cardDesc, barberType === 'salon_owner' && styles.textMutedWhite]}>
                    Tenho um espaço físico próprio onde os clientes se deslocam para receber o atendimento.
                  </Text>
                </TouchableOpacity>

                {/* Independent Mobile Barbers */}
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    barberType === 'mobile_freelancer' && styles.optionCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setBarberType('mobile_freelancer')}
                >
                  <View style={styles.cardHeader}>
                    <Navigation size={24} color={barberType === 'mobile_freelancer' ? '#fff' : '#f59e0b'} />
                    <Text style={[styles.cardTitle, barberType === 'mobile_freelancer' && styles.textWhite]}>
                      Barbeiro ao Domicílio
                    </Text>
                  </View>
                  <Text style={[styles.cardDesc, barberType === 'mobile_freelancer' && styles.textMutedWhite]}>
                    Atendo apenas em regime móvel, deslocando-me até à residência ou escritório do cliente.
                  </Text>
                </TouchableOpacity>

                {/* Hybrid Professionals */}
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    barberType === 'hybrid' && styles.optionCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setBarberType('hybrid')}
                >
                  <View style={styles.cardHeader}>
                    <CheckCircle size={24} color={barberType === 'hybrid' ? '#fff' : '#f59e0b'} />
                    <Text style={[styles.cardTitle, barberType === 'hybrid' && styles.textWhite]}>
                      Profissional Híbrido
                    </Text>
                  </View>
                  <Text style={[styles.cardDesc, barberType === 'hybrid' && styles.textMutedWhite]}>
                    Atendo no meu espaço físico e também realizo visitas ao domicílio para maior flexibilidade.
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Configurações de Operação</Text>
              <Text style={styles.stepSubtitle}>
                Preencha os detalhes correspondentes ao seu modelo de negócio selecionado.
              </Text>

              {/* Se for domicílio ou híbrido, configurar taxa e raio */}
              {(barberType === 'mobile_freelancer' || barberType === 'hybrid') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Serviço ao Domicílio</Text>
                  
                  <Text style={styles.label}>Taxa de Deslocação (Kz)</Text>
                  <View style={styles.inputIconWrapper}>
                    <DollarSign size={18} color={Colors.mutedForeground} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={homeServiceFee}
                      onChangeText={setHomeServiceFee}
                      keyboardType="numeric"
                      placeholder="Ex: 1500"
                      placeholderTextColor={Colors.mutedForeground}
                    />
                  </View>

                  <Text style={styles.label}>Raio de Cobertura Máximo: {coverageRadius} km</Text>
                  <View style={styles.radiusSelector}>
                    {[2, 5, 10, 15, 20, 30].map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.radiusChip,
                          coverageRadius === r && styles.radiusChipSelected,
                        ]}
                        onPress={() => setCoverageRadius(r)}
                      >
                        <Text style={[
                          styles.radiusChipText,
                          coverageRadius === r && styles.radiusChipTextSelected
                        ]}>
                          {r} km
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Se for salão ou híbrido, configurar nome e localização física */}
              {(barberType === 'salon_owner' || barberType === 'hybrid') && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Dados do Espaço Físico</Text>

                  <Text style={styles.label}>Nome da Barbearia / Espaço</Text>
                  <TextInput
                    style={styles.inputSimple}
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="Ex: KORTA Premium Club"
                    placeholderTextColor={Colors.mutedForeground}
                  />

                  <Text style={styles.label}>Endereço Completo</Text>
                  <TextInput
                    style={styles.inputSimple}
                    value={shopAddress}
                    onChangeText={setShopAddress}
                    placeholder="Ex: Rua Direita de Cacuaco, nº 42"
                    placeholderTextColor={Colors.mutedForeground}
                  />
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>O seu Perfil Profissional</Text>
              <Text style={styles.stepSubtitle}>
                Complete as informações que os clientes irão ver ao encontrar o seu perfil.
              </Text>

              <Text style={styles.label}>Anos de Experiência</Text>
              <TextInput
                style={styles.inputSimple}
                value={yearsExperience}
                onChangeText={setYearsExperience}
                keyboardType="numeric"
                placeholder="Ex: 5"
                placeholderTextColor={Colors.mutedForeground}
              />

              <Text style={styles.label}>Especialidades (Selecione as suas melhores habilidades)</Text>
              <View style={styles.specialtiesWrapper}>
                {specialtiesOptions.map(spec => {
                  const selected = selectedSpecialties.includes(spec);
                  return (
                    <TouchableOpacity
                      key={spec}
                      style={[styles.specialtyChip, selected && styles.specialtyChipSelected]}
                      onPress={() => toggleSpecialty(spec)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.specialtyChipText, selected && styles.specialtyChipTextSelected]}>
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Biografia / Sobre Mim</Text>
              <TextInput
                style={[styles.inputSimple, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                placeholder="Escreva um breve resumo dos seus diferenciais, estilo de corte e abordagem..."
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>
          )}
        </ScrollView>

        {/* Botões de Ação Inferiores */}
        <View style={styles.footer}>
          {step > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ChevronLeft size={20} color={Colors.foreground} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {step < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Continuar</Text>
              <ChevronRight size={20} color={Colors.primaryForeground} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color={Colors.primaryForeground} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Finalizar Registo</Text>
                  <Award size={20} color={Colors.primaryForeground} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: Spacing.md,
    backgroundColor: '#111',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 2,
  },
  headerStep: {
    fontSize: 14,
    color: Colors.mutedForeground,
    fontWeight: '600',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#222',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 50,
  },
  stepContainer: {
    gap: Spacing.md,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 32,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.mutedForeground,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  optionCardSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  cardDesc: {
    fontSize: 14,
    color: Colors.mutedForeground,
    lineHeight: 20,
  },
  textWhite: {
    color: '#fff',
  },
  textMutedWhite: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  section: {
    backgroundColor: '#111',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderColor: '#222',
    borderWidth: 1,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  inputSimple: {
    backgroundColor: '#18181b',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#222',
    padding: Spacing.md,
    color: '#fff',
    fontSize: 16,
  },
  inputIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: '#fff',
    fontSize: 16,
  },
  radiusSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  radiusChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#18181b',
  },
  radiusChipSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  radiusChipText: {
    color: '#ccc',
    fontSize: 14,
  },
  radiusChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  specialtiesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  specialtyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#111',
  },
  specialtyChipSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  specialtyChipText: {
    color: '#ccc',
    fontSize: 14,
  },
  specialtyChipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
