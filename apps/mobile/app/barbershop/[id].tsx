import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Radius } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import { ServiceItem } from '../../src/components/ServiceItem';
import { ChevronLeft, Star, MapPin, Phone, MessageCircle } from 'lucide-react-native';

export default function BarbershopDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: shop, isLoading } = useQuery({
    queryKey: ['barbershop', id],
    queryFn: () => BarbershopService.getDetails(Number(id)),
  });

  const handleWhatsApp = () => {
    if (!shop?.whatsapp) {
      alert('Esta barbearia ainda não disponibilizou o contacto de WhatsApp.');
      return;
    }
    const message = `Olá! Vi a sua barbearia ${shop.name} no app KORTA e gostaria de tirar uma dúvida.`;
    const url = `whatsapp://send?phone=${shop.whatsapp}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback para browser se o app não estiver instalado
        Linking.openURL(`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(message)}`);
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagem de Capa */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: shop?.photos?.[0]?.url || 'https://via.placeholder.com/400x300' }} 
            style={styles.coverImage} 
          />
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Header Info */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{shop?.name}</Text>
              <View style={styles.ratingBox}>
                <Star size={16} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.ratingText}>{shop?.average_rating?.toFixed(1)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <MapPin size={16} color={Colors.mutedForeground} />
              <Text style={styles.address}>{shop?.address}, {shop?.city}</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Phone size={20} color={Colors.primary} />
                <Text style={styles.actionText}>Ligar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleWhatsApp}
              >
                <MessageCircle size={20} color={Colors.primary} />
                <Text style={styles.actionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.description}>
              {shop?.description || "Uma barbearia moderna com os melhores profissionais de Angola."}
            </Text>
          </View>

          {/* Horários */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>
            <View style={styles.hoursBox}>
              <Text style={styles.hoursText}>{shop?.open_hours || "Seg-Sáb: 08:00 - 19:00"}</Text>
            </View>
          </View>

          {/* Serviços */}
          <View style={[styles.section, styles.servicesSection]}>
            <Text style={styles.sectionTitle}>Nossos Serviços</Text>
            {shop?.services?.map((service: any) => (
              <ServiceItem
                key={service.id}
                name={service.name}
                price={service.price}
                duration={service.duration_minutes}
                onPress={() => {
                  router.push({
                    pathname: '/booking/create',
                    params: {
                      barbershopId: shop.id,
                      serviceId: service.id,
                      serviceName: service.name,
                      price: service.price
                    }
                  });
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  imageContainer: {
    height: 280,
    width: '100%',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    marginTop: -Spacing.xl,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.foreground,
    flex: 1,
    marginRight: Spacing.sm,
    letterSpacing: -0.5,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  address: {
    fontSize: 15,
    color: Colors.mutedForeground,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: Spacing.lg,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: Colors.mutedForeground,
    lineHeight: 26,
  },
  hoursBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hoursText: {
    fontSize: 16,
    color: Colors.foreground,
    fontWeight: '600',
  },
  servicesSection: {
    marginBottom: Spacing.xxl,
  }
});
