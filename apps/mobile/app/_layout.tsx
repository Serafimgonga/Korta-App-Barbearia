import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../src/store/auth";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../src/theme";
import { Alert } from "react-native";
import { useAlertStore } from "../src/store/alert";
import CustomAlertModal from "../src/components/CustomAlertModal";

// Override global de Alert.alert para usar o nosso modal premium customizado em todas as plataformas
Alert.alert = (title: string, message?: string, buttons?: any[]) => {
  useAlertStore.getState().showAlert(title, message, buttons);
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const { isAuthenticated, user, initialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inBarberGroup = segments[0] === "(barber)";

    if (!isAuthenticated) {
      // Se não autenticado e nas rotas logadas, força redirecionamento para welcome
      if (inTabsGroup || inBarberGroup) {
        router.replace("/");
      }
    } else if (isAuthenticated && user) {
      // Se autenticado e na raiz ou login/registo, redireciona para a respetiva área de trabalho
      if (!inTabsGroup && !inBarberGroup) {
        if (user.role === "barber") {
          router.replace("/(barber)/dashboard");
        } else {
          router.replace("/(tabs)");
        }
      }
    }
  }, [isAuthenticated, user, segments, initialized]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(barber)" />
      </Stack>
      <CustomAlertModal />
    </QueryClientProvider>
  );
}
