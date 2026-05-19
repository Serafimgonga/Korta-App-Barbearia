import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme';
import { LayoutDashboard, Store, Scissors, CalendarClock } from 'lucide-react-native';

export default function BarberLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontWeight: '900',
          color: Colors.primary,
          letterSpacing: 2,
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerTitle: 'KORTA PRO',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-shop"
        options={{
          title: 'Minha Loja',
          headerTitle: 'Minha Barbearia',
          tabBarIcon: ({ color, size }) => <Store size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          headerTitle: 'Gerir Serviços',
          tabBarIcon: ({ color, size }) => <Scissors size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-bookings"
        options={{
          title: 'Agendamentos',
          headerTitle: 'Agendamentos',
          tabBarIcon: ({ color, size }) => <CalendarClock size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
