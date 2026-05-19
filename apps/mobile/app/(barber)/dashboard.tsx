import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { BarbershopService } from '../../src/services/barbershops';
import {
  Star, Users, Calendar, TrendingUp,
  Plus, LogOut, Scissors, ChevronRight,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function BarberDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      const data = await BarbershopService.getMyBarbershops();
      setShops(Array.isArray(data) ? data : []);
    } catch (e) {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const totalReviews = shops.reduce((s, b) => s + (b.total_reviews || 0), 0);
  const avgRating = shops.length > 0
    ? (shops.reduce((s, b) => s + (b.average_rating || 0), 0) / shops.length).toFixed(1)
    : '—';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header de boas-vindas */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Scissors size={28} color={Colors.primary} strokeWidth={1.5} />
            </View>
            <View>
              <Text style={styles.greeting}>Bem-vindo, 👋</Text>
              <Text style={styles.name}>{user?.name}</Text>
              <View style={styles.badge}>
                <Scissors size={10} color={Colors.primaryForeground} />
                <Text style={styles.badgeText}>BARBEIRO PRO</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={Colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}><Star size={18} color={Colors.primary} /></View>
            <Text style={styles.statValue}>{avgRating}</Text>
            <Text style={styles.statLabel}>Avaliação Média</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}><Users size={18} color={Colors.primary} /></View>
            <Text style={styles.statValue}>{totalReviews}</Text>
            <Text style={styles.statLabel}>Total Reviews</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}><TrendingUp size={18} color={Colors.primary} /></View>
            <Text style={styles.statValue}>{shops.length}</Text>
            <Text style={styles.statLabel}>Barbearias</Text>
          </View>
        </View>

        {/* Acções Rápidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acções Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(barber)/my-shop')}
            >
              <View style={styles.actionIcon}><Plus size={22} color={Colors.primaryForeground} /></View>
              <Text style={styles.actionText}>Nova{'\n'}Barbearia</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(barber)/services')}
            >
              <View style={styles.actionIcon}><Scissors size={22} color={Colors.primaryForeground} /></View>
              <Text style={styles.actionText}>Gerir{'\n'}Serviços</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/(barber)/my-bookings')}
            >
              <View style={styles.actionIcon}><Calendar size={22} color={Colors.primaryForeground} /></View>
              <Text style={styles.actionText}>Ver{'\n'}Agendamentos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Minhas Barbearias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>As Minhas Barbearias</Text>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.lg }} />
          ) : shops.length === 0 ? (
            <View style={styles.emptyCard}>
              <Scissors size={40} color={Colors.mutedForeground} strokeWidth={1} />
              <Text style={styles.emptyTitle}>Ainda sem barbearias</Text>
              <Text style={styles.emptyDesc}>
                Cria a tua primeira barbearia e começa a receber agendamentos.
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
            shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                activeOpacity={0.8}
                onPress={() => router.push('/(barber)/my-shop')}
              >
                <View style={styles.shopCardLeft}>
                  <View style={[
                    styles.shopStatusDot,
                    { backgroundColor: shop.status === 'open' ? Colors.success : Colors.error }
                  ]} />
                  <View>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopCity}>{shop.city}</Text>
                    <View style={styles.shopMeta}>
                      <Star size={12} color={Colors.primary} fill={Colors.primary} />
                      <Text style={styles.shopRating}>{shop.average_rating?.toFixed(1)}</Text>
                      <Text style={styles.shopReviews}>({shop.total_reviews} reviews)</Text>
                      {shop.is_premium && (
                        <View style={styles.premiumBadge}>
                          <Text style={styles.premiumText}>PREMIUM</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <ChevronRight size={18} color={Colors.mutedForeground} />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.xl, paddingTop: Spacing.lg,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  greeting: { fontSize: 13, color: Colors.mutedForeground },
  name: { fontSize: 20, fontWeight: '900', color: Colors.foreground },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: Radius.full, marginTop: 4, alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 9, fontWeight: '900', color: Colors.primaryForeground, letterSpacing: 1 },
  logoutBtn: { padding: Spacing.sm },

  statsRow: {
    flexDirection: 'row', gap: Spacing.md,
    padding: Spacing.xl, paddingBottom: 0,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: Radius.full,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  statValue: { fontSize: 22, fontWeight: '900', color: Colors.foreground },
  statLabel: { fontSize: 10, color: Colors.mutedForeground, textAlign: 'center', marginTop: 2 },

  section: { padding: Spacing.xl, paddingBottom: 0 },
  sectionTitle: {
    fontSize: 11, fontWeight: '900', color: Colors.primary,
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: Spacing.md,
  },

  actionsGrid: { flexDirection: 'row', gap: Spacing.md },
  actionCard: {
    flex: 1, backgroundColor: Colors.surface2, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  actionIcon: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    ...Shadows.gold,
  },
  actionText: { fontSize: 12, fontWeight: '700', color: Colors.foreground, textAlign: 'center' },

  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xxl, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, gap: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  emptyDesc: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.md,
    ...Shadows.gold,
  },
  createBtnText: { fontSize: 15, fontWeight: '800', color: Colors.primaryForeground },

  shopCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  shopCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  shopStatusDot: { width: 10, height: 10, borderRadius: 5 },
  shopName: { fontSize: 16, fontWeight: '800', color: Colors.foreground },
  shopCity: { fontSize: 13, color: Colors.mutedForeground, marginTop: 2 },
  shopMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  shopRating: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  shopReviews: { fontSize: 12, color: Colors.mutedForeground },
  premiumBadge: {
    backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 1, borderRadius: Radius.full,
  },
  premiumText: { fontSize: 8, fontWeight: '900', color: Colors.primaryForeground, letterSpacing: 1 },
});
