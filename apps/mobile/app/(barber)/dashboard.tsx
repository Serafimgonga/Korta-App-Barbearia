import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
  Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { UserService } from '../../src/services/users';
import { useBarberStore } from '../../src/store/barber';
import { BookingService } from '../../src/services/bookings';
import ShopSelectorHeader from '../../src/components/ShopSelectorHeader';

import {
  Calendar, Scissors, Image as ImageIcon, Settings,
  ChevronRight, Plus, Star, Navigation, MapPin,
  Zap, TrendingUp, Store, Clock,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

type BarberType = 'salon_owner' | 'mobile_freelancer' | 'hybrid';
type HybridMode = 'salon' | 'mobile';

export default function BarberDashboard() {
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuthStore();
  const { shops, activeShop, loadShops } = useBarberStore();

  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [barberProfile, setBarberProfile] = useState<any>(null);
  const [hybridMode, setHybridMode] = useState<HybridMode>('salon');

  // ── Derivar tipo ────────────────────────────────────────────────────────────
  const barberType: BarberType = barberProfile?.barber_type || 'salon_owner';
  const isSalon = barberType === 'salon_owner' || (barberType === 'hybrid' && hybridMode === 'salon');
  const isMobile = barberType === 'mobile_freelancer' || (barberType === 'hybrid' && hybridMode === 'mobile');

  // ── Carregar perfil ──────────────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const profile = await UserService.getBarberProfile();
      setBarberProfile(profile);
    } catch (e) {
      console.error('Erro ao carregar perfil:', e);
    }
  };

  // ── Carregar marcações (adapta ao tipo de barbeiro) ─────────────────────────
  const loadDashboardData = async (type?: BarberType) => {
    const bt = type || barberType;
    setDataLoading(true);
    try {
      if (bt === 'salon_owner') {
        // Salão: precisa de barbearia activa
        if (!activeShop) { setBookings([]); return; }
        const data = await BookingService.getActiveShopBookings();
        setBookings(Array.isArray(data) ? data : []);
      } else if (bt === 'mobile_freelancer') {
        // Freelancer: marcações pessoais (sem barbearia)
        const data = await BookingService.myBookings();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        // Híbrido: junta as duas fontes
        const [shopData, myData] = await Promise.all([
          activeShop ? BookingService.getActiveShopBookings().catch(() => []) : Promise.resolve([]),
          BookingService.myBookings().catch(() => []),
        ]);
        const shopArr = Array.isArray(shopData) ? shopData : [];
        const myArr = Array.isArray(myData) ? myData : [];
        // Deduplicar por id
        const map = new Map<number, any>();
        [...shopArr, ...myArr].forEach(b => map.set(b.id, b));
        setBookings(Array.from(map.values()));
      }
    } catch {
      setBookings([]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => { loadShops(); loadProfile(); }, []);
  useEffect(() => {
    if (barberProfile) loadDashboardData();
  }, [activeShop, barberProfile, hybridMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShops();
    await loadProfile();
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    useBarberStore.getState().reset();
    await logout();
    router.replace('/');
  };

  const handleDefinicoesPress = () => Alert.alert('Definições', '', [
    { text: 'Editar Barbearia', onPress: () => router.push('/(barber)/my-shop') },
    { text: 'Terminar Sessão', onPress: handleLogout, style: 'destructive' },
    { text: 'Cancelar', style: 'cancel' },
  ]);

  const toggleOnline = async () => {
    try {
      const newState = !user?.is_online;
      await UserService.setOnline(newState);
      if (user && token) await setAuth({ ...user, is_online: newState }, token);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o estado.');
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString().split('T')[0];

  const paidStatuses = ['confirmed', 'completed'];
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const todayRevenue = todayBookings.filter(b => paidStatuses.includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const weekBookings = bookings.filter(b => b.date >= weekAgo && b.status !== 'cancelled');
  const weekRevenue = weekBookings.filter(b => paidStatuses.includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const totalRevenue = bookings.filter(b => paidStatuses.includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Tabs.Screen options={{ headerShown: false }} />

      {/* ── HEADER adaptativo ─────────────────────────────────────────────── */}
      {isSalon ? (
        <ShopSelectorHeader showCreateOption onCreatePress={() => router.push('/(barber)/my-shop')} />
      ) : (
        /* Header simples para modo móvel */
        <View style={styles.mobileHeader}>
          <View>
            <Text style={styles.mobileHeaderGreeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
            <View style={styles.mobileTypeBadgeRow}>
              {barberType === 'hybrid' ? (
                <View style={[styles.mobileTypeBadge, styles.mobileTypeBadgeHybrid]}>
                  <Sparkles size={10} color="#f59e0b" strokeWidth={2} />
                  <Text style={[styles.mobileTypeBadgeText, { color: '#f59e0b' }]}>HÍBRIDO</Text>
                </View>
              ) : (
                <View style={[styles.mobileTypeBadge, styles.mobileTypeBadgeFreelancer]}>
                  <Navigation size={10} color="#fb923c" strokeWidth={2} />
                  <Text style={[styles.mobileTypeBadgeText, { color: '#fb923c' }]}>FREELANCER</Text>
                </View>
              )}
              <Text style={styles.mobileHeaderSub}>
                {barberType === 'hybrid' ? 'Modo Domicílio' : 'Barbeiro Independente'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={handleDefinicoesPress}>
            <Settings size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── TOGGLE MODO (só Híbrido) ──────────────────────────────────────── */}
      {barberType === 'hybrid' && (
        <View style={styles.modeToggleBar}>
          <TouchableOpacity
            style={[styles.modeToggleBtn, hybridMode === 'salon' && styles.modeToggleBtnActive]}
            onPress={() => setHybridMode('salon')}
          >
            <Store size={14} color={hybridMode === 'salon' ? '#000' : Colors.mutedForeground} />
            <Text style={[styles.modeToggleText, hybridMode === 'salon' && styles.modeToggleTextActive]}>
              Modo Salão
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeToggleBtn, hybridMode === 'mobile' && styles.modeToggleBtnActive]}
            onPress={() => setHybridMode('mobile')}
          >
            <Navigation size={14} color={hybridMode === 'mobile' ? '#000' : Colors.mutedForeground} />
            <Text style={[styles.modeToggleText, hybridMode === 'mobile' && styles.modeToggleTextActive]}>
              Modo Domicílio
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >

        {/* ══════════════════════════════════════════════════════════════════
            VISTA SALÃO (salon_owner ou hybrid em modo salão)
        ══════════════════════════════════════════════════════════════════ */}
        {isSalon && (
          shops.length === 0 ? (
            <View style={styles.emptyCard}>
              <Scissors size={48} color={Colors.mutedForeground} strokeWidth={1} />
              <Text style={styles.emptyTitle}>Ainda sem barbearias</Text>
              <Text style={styles.emptyDesc}>Cria a tua primeira barbearia para começar a receber agendamentos.</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(barber)/my-shop')}>
                <Plus size={18} color="#000" />
                <Text style={styles.createBtnText}>Criar Barbearia</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {dataLoading && bookings.length === 0 && <ActivityIndicator color={Colors.primary} style={{ margin: Spacing.md }} />}

              {/* Stats de Hoje */}
              <Text style={styles.sectionLabel}>Hoje</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCard}>
                  <Calendar size={16} color={Colors.primary} style={{ marginBottom: 4 }} />
                  <Text style={styles.statValue}>{todayBookings.length}</Text>
                  <Text style={styles.statLabel}>Marcações</Text>
                </View>
                <View style={styles.statCard}>
                  <TrendingUp size={16} color={Colors.primary} style={{ marginBottom: 4 }} />
                  <Text style={[styles.statValue, { fontSize: 16 }]} numberOfLines={1}>{todayRevenue.toLocaleString('pt-AO')} Kz</Text>
                  <Text style={styles.statLabel}>Faturamento</Text>
                </View>
                <View style={styles.statCard}>
                  <Clock size={16} color="#a78bfa" style={{ marginBottom: 4 }} />
                  <Text style={[styles.statValue, { color: pendingCount > 0 ? '#f59e0b' : Colors.foreground }]}>{pendingCount}</Text>
                  <Text style={styles.statLabel}>Pendentes</Text>
                </View>
              </View>

              {/* Stats Gerais */}
              <Text style={styles.sectionLabel}>Geral</Text>
              <View style={styles.statGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{bookings.filter(b => b.status !== 'cancelled').length}</Text>
                  <Text style={styles.statLabel}>Total Cortes</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { fontSize: 15, color: Colors.primary }]} numberOfLines={1}>{totalRevenue.toLocaleString('pt-AO')} Kz</Text>
                  <Text style={styles.statLabel}>Receita Total</Text>
                </View>
                {activeShop?.average_rating > 0 && (
                  <View style={styles.statCard}>
                    <Star size={16} color={Colors.primary} fill={Colors.primary} style={{ marginBottom: 4 }} />
                    <Text style={styles.statValue}>{activeShop.average_rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Avaliação</Text>
                  </View>
                )}
              </View>

              {/* Menu Salão */}
              <View style={styles.menuSection}>
                <MenuItem icon={<Calendar size={16} color="#5B21B6" />} iconBg="#EDE9FE" label="Marcações" badge={pendingCount > 0 ? `${pendingCount} nova${pendingCount > 1 ? 's' : ''}` : undefined} onPress={() => router.push('/(barber)/my-bookings')} />
                <MenuItem icon={<Scissors size={16} color="#0F6E56" />} iconBg="#E1F5EE" label="Serviços" onPress={() => router.push('/(barber)/services')} />
                <MenuItem icon={<ImageIcon size={16} color="#854F0B" />} iconBg="#FAEEDA" label="Fotos do Espaço" onPress={() => Alert.alert('Em breve', 'Gestão de fotos disponível na próxima versão.')} />
                <MenuItem icon={<Settings size={16} color="#5F5E5A" />} iconBg="#F1EFE8" label="Definições" onPress={handleDefinicoesPress} last />
              </View>

              {/* Card da Barbearia Ativa */}
              {activeShop && (
                <View style={styles.shopCard}>
                  <Text style={styles.shopCardLabel}>Barbearia Activa</Text>
                  <Text style={styles.shopCardName}>{activeShop.name}</Text>
                  <Text style={styles.shopCardInfo}>📍 {activeShop.city} · {activeShop.address}</Text>
                  <Text style={styles.shopCardInfo}>⏰ {activeShop.open_hours || 'Horário não definido'}</Text>
                  {activeShop.average_rating > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Star size={12} color={Colors.primary} fill={Colors.primary} />
                      <Text style={styles.shopCardInfo}>{activeShop.average_rating?.toFixed(1)} ({activeShop.total_reviews} avaliações)</Text>
                    </View>
                  )}
                  {/* Toggle Aberto/Fechado */}
                  <TouchableOpacity style={[styles.statusToggle, { backgroundColor: user?.is_online ? '#DCFCE7' : Colors.surface2 }]} onPress={toggleOnline}>
                    <View style={[styles.statusDot, { backgroundColor: user?.is_online ? '#16A34A' : Colors.mutedForeground }]} />
                    <Text style={[styles.statusToggleText, { color: user?.is_online ? '#064E3B' : Colors.mutedForeground }]}>
                      {user?.is_online ? 'ABERTO — A receber marcações' : 'FECHADO — Não visível para clientes'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VISTA MÓVEL (mobile_freelancer ou hybrid em modo domicílio)
        ══════════════════════════════════════════════════════════════════ */}
        {isMobile && (
          <View style={styles.mobileView}>
            {/* Toggle grande de disponibilidade */}
            <TouchableOpacity
              style={[styles.availabilityToggle, user?.is_online ? styles.availabilityOn : styles.availabilityOff]}
              onPress={toggleOnline}
              activeOpacity={0.85}
            >
              <View style={styles.availabilityInner}>
                <Zap size={32} color={user?.is_online ? '#000' : Colors.mutedForeground} strokeWidth={2} />
                <View>
                  <Text style={[styles.availabilityStatus, { color: user?.is_online ? '#000' : Colors.foreground }]}>
                    {user?.is_online ? 'DISPONÍVEL' : 'INDISPONÍVEL'}
                  </Text>
                  <Text style={[styles.availabilitySub, { color: user?.is_online ? '#1a1a00' : Colors.mutedForeground }]}>
                    {user?.is_online ? 'A receber pedidos ao domicílio' : 'Toca para ficar disponível'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Info de operação */}
            <View style={styles.operationCard}>
              <View style={styles.operationRow}>
                <View style={styles.operationItem}>
                  <MapPin size={18} color={Colors.primary} />
                  <Text style={styles.operationLabel}>Raio de cobertura</Text>
                  <Text style={styles.operationValue}>{barberProfile?.coverage_radius_km || 5} km</Text>
                </View>
                <View style={styles.operationDivider} />
                <View style={styles.operationItem}>
                  <Navigation size={18} color={Colors.primary} />
                  <Text style={styles.operationLabel}>Taxa de deslocação</Text>
                  <Text style={styles.operationValue}>{(barberProfile?.home_service_fee || 0).toLocaleString('pt-AO')} Kz</Text>
                </View>
              </View>
            </View>

            {/* Stats do dia / semana */}
            <Text style={styles.sectionLabel}>Ganhos</Text>
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Zap size={16} color={Colors.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.statValue}>{todayBookings.length}</Text>
                <Text style={styles.statLabel}>Pedidos hoje</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={16} color={Colors.primary} style={{ marginBottom: 4 }} />
                <Text style={[styles.statValue, { fontSize: 15 }]} numberOfLines={1}>{todayRevenue.toLocaleString('pt-AO')} Kz</Text>
                <Text style={styles.statLabel}>Ganhos hoje</Text>
              </View>
              <View style={styles.statCard}>
                <Calendar size={16} color="#a78bfa" style={{ marginBottom: 4 }} />
                <Text style={[styles.statValue, { fontSize: 15 }]} numberOfLines={1}>{weekRevenue.toLocaleString('pt-AO')} Kz</Text>
                <Text style={styles.statLabel}>Esta semana</Text>
              </View>
            </View>

            {/* Menu Móvel */}
            <View style={styles.menuSection}>
              <MenuItem icon={<Zap size={16} color="#854F0B" />} iconBg="#FAEEDA" label="Pedidos ao Domicílio" badge={pendingCount > 0 ? `${pendingCount}` : undefined} onPress={() => router.push('/(barber)/requests')} />
              <MenuItem icon={<Scissors size={16} color="#0F6E56" />} iconBg="#E1F5EE" label="Os meus Serviços" onPress={() => router.push('/(barber)/services')} />
              <MenuItem icon={<Star size={16} color="#5B21B6" />} iconBg="#EDE9FE" label="Avaliações" onPress={() => Alert.alert('Em breve', 'Histórico de avaliações disponível em breve.')} />
              <MenuItem icon={<Settings size={16} color="#5F5E5A" />} iconBg="#F1EFE8" label="Definições" onPress={handleDefinicoesPress} last />
            </View>

            {/* Info do perfil */}
            {barberProfile?.specialties ? (
              <View style={styles.profileCard}>
                <Text style={styles.shopCardLabel}>O meu Perfil</Text>
                <Text style={styles.shopCardInfo}>✂️ {barberProfile.specialties}</Text>
                {barberProfile.years_experience > 0 && (
                  <Text style={styles.shopCardInfo}>🏆 {barberProfile.years_experience} anos de experiência</Text>
                )}
                {barberProfile.bio ? <Text style={[styles.shopCardInfo, { marginTop: 4, fontStyle: 'italic' }]}>"{barberProfile.bio}"</Text> : null}
              </View>
            ) : null}
          </View>
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

// ── Componente MenuItem reutilizável ─────────────────────────────────────────
function MenuItem({ icon, iconBg, label, badge, onPress, last }: {
  icon: React.ReactNode; iconBg: string; label: string;
  badge?: string; onPress: () => void; last?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.menuItem, last && { borderBottomWidth: 0 }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.menuText}>{label}</Text>
      {badge ? (
        <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
      ) : (
        <ChevronRight size={16} color={Colors.mutedForeground} style={{ marginLeft: 'auto' }} />
      )}
    </TouchableOpacity>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  scroll: { flexGrow: 1, paddingBottom: 32 },

  // Header móvel
  mobileHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mobileHeaderGreeting: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  mobileTypeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  mobileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  mobileTypeBadgeHybrid: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  mobileTypeBadgeFreelancer: {
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  mobileTypeBadgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  mobileHeaderSub: { fontSize: 12, color: Colors.mutedForeground },
  settingsBtn: {
    width: 40, height: 40, borderRadius: Radius.md,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Toggle de modo (híbrido)
  modeToggleBar: {
    flexDirection: 'row', margin: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: 4, borderWidth: 1, borderColor: Colors.border,
  },
  modeToggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: Radius.sm,
  },
  modeToggleBtnActive: { backgroundColor: Colors.primary },
  modeToggleText: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  modeToggleTextActive: { color: '#000' },

  // Stats
  sectionLabel: {
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xs,
    fontSize: 11, fontWeight: '700', color: Colors.mutedForeground,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  statGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md,
    padding: 12, borderWidth: 1, borderColor: Colors.border,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.foreground },
  statLabel: { fontSize: 11, color: Colors.mutedForeground, marginTop: 2 },

  // Menu
  menuSection: {
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.surface, marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  menuIcon: { width: 32, height: 32, borderRadius: Radius.sm - 2, justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 14, fontWeight: '600', color: Colors.foreground },
  badge: { marginLeft: 'auto', backgroundColor: '#D85A30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },

  // Shop card
  shopCard: {
    margin: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  shopCardLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.primary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  shopCardName: { fontSize: 16, fontWeight: '800', color: Colors.foreground },
  shopCardInfo: { fontSize: 12, color: Colors.mutedForeground, lineHeight: 18 },

  // Status toggle (salão)
  statusToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusToggleText: { fontSize: 12, fontWeight: '700', flex: 1 },

  // Mobile view
  mobileView: { flex: 1 },

  // Availability toggle (modo móvel)
  availabilityToggle: {
    margin: Spacing.md, borderRadius: Radius.xl, padding: Spacing.xl,
    borderWidth: 2,
  },
  availabilityOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  availabilityOff: { backgroundColor: Colors.surface, borderColor: Colors.border },
  availabilityInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  availabilityStatus: { fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  availabilitySub: { fontSize: 13, marginTop: 2 },

  // Operation info card
  operationCard: {
    marginHorizontal: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  operationRow: { flexDirection: 'row', alignItems: 'center' },
  operationItem: { flex: 1, alignItems: 'center', gap: 4 },
  operationLabel: { fontSize: 11, color: Colors.mutedForeground, textAlign: 'center' },
  operationValue: { fontSize: 16, fontWeight: '800', color: Colors.foreground, textAlign: 'center' },
  operationDivider: { width: 1, height: 40, backgroundColor: Colors.border },

  // Profile card
  profileCard: {
    margin: Spacing.md, backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },

  // Empty state
  emptyCard: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, margin: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    marginTop: Spacing.md, ...Shadows.gold,
  },
  createBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
});
