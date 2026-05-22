import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert, RefreshControl,
  Platform, StatusBar as RNStatusBar
} from 'react-native';
import { useRouter, Tabs } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { useBarberStore } from '../../src/store/barber';
import { BookingService } from '../../src/services/bookings';
import ShopSelectorHeader from '../../src/components/ShopSelectorHeader';
import {
  Calendar, Scissors, Image as ImageIcon, Settings,
  ChevronRight, Plus, LogOut, Star
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function BarberDashboard() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { shops, activeShop, loading, loadShops } = useBarberStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    loadShops();
  }, []);

  const loadDashboardData = async () => {
    if (!activeShop) return;
    setDataLoading(true);
    try {
      const data = await BookingService.getActiveShopBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      setBookings([]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeShop) {
      loadDashboardData();
    } else {
      setBookings([]);
    }
  }, [activeShop]);

  const handleLogout = async () => {
    useBarberStore.getState().reset();
    await logout();
    router.replace('/');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShops();
    if (activeShop) {
      await loadDashboardData();
    }
    setRefreshing(false);
  };

  // Obter data local formatada YYYY-MM-DD
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const todayBookings = bookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const todayBookingsCount = todayBookings.length;
  
  const todayRevenue = todayBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const totalBookingsCount = bookings.filter(b => b.status !== 'cancelled').length;

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  const handleDefinicoesPress = () => {
    Alert.alert(
      'Definições',
      'Menu de configurações e encerramento de sessão.',
      [
        { text: 'Editar Barbearia', onPress: () => router.push('/(barber)/my-shop') },
        { text: 'Terminar Sessão', onPress: handleLogout, style: 'destructive' },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleFotosPress = () => {
    Alert.alert(
      'Galeria de Fotos',
      'O upload e gestão de fotos do portfólio estarão disponíveis na próxima actualização.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Oculta o cabeçalho padrão das Tabs para usarmos o nosso seletor personalizado */}
      <Tabs.Screen options={{ headerShown: false }} />

      {/* Topbar Selector de Barbearia */}
      <ShopSelectorHeader
        showCreateOption
        onCreatePress={() => router.push('/(barber)/my-shop')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {shops.length === 0 ? (
          /* Sem barbearias criadas */
          <View style={styles.emptyCard}>
            <Scissors size={48} color={Colors.mutedForeground} strokeWidth={1} />
            <Text style={styles.emptyTitle}>Ainda sem barbearias</Text>
            <Text style={styles.emptyDesc}>
              Cria a tua primeira barbearia para começar a receber agendamentos e gerir os teus serviços.
            </Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/(barber)/my-shop')}
            >
              <Plus size={18} color={Colors.primaryForeground} />
              <Text style={styles.createBtnText}>Criar Barbearia</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Painel da barbearia ativa */
          <View style={styles.dashboardContent}>
            {dataLoading && bookings.length === 0 && (
              <ActivityIndicator color={Colors.primary} style={styles.loader} />
            )}

            {/* Secção Hoje */}
            <Text style={styles.sectionLabel}>Hoje</Text>
            
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Marcações (Hoje)</Text>
                <Text style={styles.statValue}>{todayBookingsCount}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Faturamento (Hoje)</Text>
                <Text style={[styles.statValue, { fontSize: 16 }]} numberOfLines={1}>
                  {todayRevenue.toLocaleString('pt-AO')} Kz
                </Text>
              </View>
            </View>

            {/* Secção Geral */}
            <Text style={styles.sectionLabel}>Resumo Geral</Text>
            
            <View style={styles.statGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total de Cortes</Text>
                <Text style={styles.statValue}>{totalBookingsCount}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Receita Total</Text>
                <Text style={[styles.statValue, { fontSize: 16, color: Colors.primary }]} numberOfLines={1}>
                  {totalRevenue.toLocaleString('pt-AO')} Kz
                </Text>
              </View>
            </View>

            {/* Secção Menu */}
            <View style={styles.menuSection}>
              {/* Marcações */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push('/(barber)/my-bookings')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#EDE9FE' }]}>
                  <Calendar size={16} color="#5B21B6" />
                </View>
                <Text style={styles.menuText}>Marcações</Text>
                {pendingCount > 0 ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>
                      {pendingCount === 1 ? '1 nova' : `${pendingCount} novas`}
                    </Text>
                  </View>
                ) : (
                  <ChevronRight size={16} color={Colors.mutedForeground} style={styles.chevronRight} />
                )}
              </TouchableOpacity>

              {/* Serviços */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => router.push('/(barber)/services')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#E1F5EE' }]}>
                  <Scissors size={16} color="#0F6E56" />
                </View>
                <Text style={styles.menuText}>Serviços</Text>
                <ChevronRight size={16} color={Colors.mutedForeground} style={styles.chevronRight} />
              </TouchableOpacity>

              {/* Fotos */}
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={handleFotosPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#FAEEDA' }]}>
                  <ImageIcon size={16} color="#854F0B" />
                </View>
                <Text style={styles.menuText}>Fotos</Text>
                <ChevronRight size={16} color={Colors.mutedForeground} style={styles.chevronRight} />
              </TouchableOpacity>

              {/* Definições */}
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                activeOpacity={0.7}
                onPress={handleDefinicoesPress}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#F1EFE8' }]}>
                  <Settings size={16} color="#5F5E5A" />
                </View>
                <Text style={styles.menuText}>Definições</Text>
                <ChevronRight size={16} color={Colors.mutedForeground} style={styles.chevronRight} />
              </TouchableOpacity>
            </View>

            {/* Detalhes Rápidos da Barbearia Activa */}
            {activeShop && (
              <View style={styles.shopDetailCard}>
                <Text style={styles.shopDetailTitle}>Barbearia Selecionada</Text>
                <Text style={styles.shopDetailName}>{activeShop.name}</Text>
                <Text style={styles.shopDetailInfo}>📍 {activeShop.city} · {activeShop.address}</Text>
                <Text style={styles.shopDetailInfo}>⏰ {activeShop.open_hours || 'Horário não definido'}</Text>
                <View style={styles.shopDetailMeta}>
                  <Star size={14} color={Colors.primary} fill={Colors.primary} />
                  <Text style={styles.shopDetailRating}>
                    {activeShop.average_rating?.toFixed(1) || '0.0'} ({activeShop.total_reviews || 0} avaliações)
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  dashboardContent: {
    flex: 1,
  },
  loader: {
    marginVertical: Spacing.md,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.foreground,
  },
  menuSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.foreground,
  },
  menuBadge: {
    marginLeft: 'auto',
    backgroundColor: '#D85A30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  menuBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  chevronRight: {
    marginLeft: 'auto',
  },

  // Empty state styles
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    margin: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.foreground,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    ...Shadows.gold,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryForeground,
  },

  // Active shop details card
  shopDetailCard: {
    margin: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  shopDetailTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  shopDetailName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.foreground,
  },
  shopDetailInfo: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  shopDetailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  shopDetailRating: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mutedForeground,
  },
});
