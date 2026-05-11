import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { useRouter } from 'expo-router';
import {
  User as UserIcon,
  LogOut,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  Scissors,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Cabeçalho com avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <UserIcon size={44} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.name}>{user?.name || 'Visitante'}</Text>
        <Text style={styles.email}>{user?.email || 'faz login para acederes ao teu perfil'}</Text>

        {user?.role === 'barber' && (
          <View style={styles.roleBadge}>
            <Scissors size={12} color={Colors.primaryForeground} />
            <Text style={styles.roleBadgeText}>BARBEIRO</Text>
          </View>
        )}
      </View>

      {/* Menu de opções */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>A minha conta</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <UserIcon size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Editar Perfil</Text>
          </View>
          <ChevronRight size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Bell size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Notificações</Text>
          </View>
          <ChevronRight size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Shield size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Privacidade</Text>
          </View>
          <ChevronRight size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.menuItemLeft}>
            <View style={styles.menuIcon}>
              <Settings size={18} color={Colors.primary} />
            </View>
            <Text style={styles.menuItemText}>Definições</Text>
          </View>
          <ChevronRight size={18} color={Colors.mutedForeground} />
        </TouchableOpacity>

        {/* Botão de sair */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>KORTA v1.0.0 — Ícolo e Bengo, Angola 🇦🇴</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: Spacing.xxl,
    ...Shadows.elegant,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.foreground,
    letterSpacing: -0.5,
  },
  email: {
    fontSize: 14,
    color: Colors.mutedForeground,
    marginTop: 4,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryForeground,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.foreground,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.xl,
    fontSize: 11,
    color: Colors.mutedForeground,
    letterSpacing: 0.5,
  },
});
