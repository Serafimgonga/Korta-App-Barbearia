import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../src/theme';
import { useAuthStore } from '../../src/store/auth';
import { AuthService } from '../../src/services/auth';
import { User, LogOut, ChevronRight } from 'lucide-react-native';

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
          <ChevronRight size={20} color={Colors.gray[400]} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Definições</Text>
          <ChevronRight size={20} color={Colors.gray[400]} />
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
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  menu: {
    padding: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  logoutButton: {
    marginTop: Spacing.xl,
    borderBottomWidth: 0,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
});
