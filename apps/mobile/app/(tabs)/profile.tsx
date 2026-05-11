import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { AuthService } from '../../src/services/auth';
import { User as UserIcon, LogOut, ChevronRight, Settings, Bell, Shield } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await AuthService.logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={40} color={Colors.primary} />
        </View>
        <Text style={styles.userName}>{user?.name || 'Visitante'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'faz login para ver o teu perfil'}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Editar Perfil</Text>
          <ChevronRight size={20} color={Colors.mutedForeground} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Definições</Text>
          <ChevronRight size={20} color={Colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Sair da Conta</Text>
          <LogOut size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 60,
    ...Shadows.elegant,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
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
  content: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
    gap: 12,
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
    gap: 8,
    marginTop: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '700',
  },
});
