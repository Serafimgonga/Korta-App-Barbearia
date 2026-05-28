import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { Star, MapPin, Clock, Scissors, Crown } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BarbershopCardProps {
  name: string;
  address: string;
  city?: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  isPremium?: boolean;
  status?: string;
  openHours?: string;
  index?: number;
  onPress?: () => void;
}

export const BarbershopCard = ({
  name, address, city, rating, reviewsCount,
  imageUrl, isPremium, status, openHours, index = 0, onPress,
}: BarbershopCardProps) => {

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const delay = index * 120;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, delay, useNativeDriver: true, damping: 18, stiffness: 100, mass: 1 }),
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true, damping: 20, stiffness: 120, mass: 1 }),
    ]).start();
  }, []);

  const isOpen = status === 'open';
  const ratingDisplay = rating > 0 ? rating.toFixed(1) : '—';

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.92}>
        {/* Imagem com overlay */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Scissors size={48} color={Colors.primary} strokeWidth={1} />
            </View>
          )}

          {/* Badge Premium */}
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Crown size={10} color={Colors.primaryForeground} />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </View>
          )}

          {/* Rating flutuante */}
          <View style={styles.ratingFloat}>
            <Star size={12} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingFloatText}>{ratingDisplay}</Text>
          </View>

          {/* Status badge */}
          <View style={[styles.statusBadge, { backgroundColor: isOpen ? Colors.success : Colors.error }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{isOpen ? 'Aberto' : 'Fechado'}</Text>
          </View>

          {/* Nome sobre a imagem */}
          <View style={styles.imageInfo}>
            <Text style={styles.nameOverImage} numberOfLines={1}>{name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.cityOverImage} numberOfLines={1}>{city || address}</Text>
            </View>
          </View>
        </View>

        {/* Info card inferior */}
        <View style={styles.info}>
          <View style={styles.infoRow}>
            <MapPin size={13} color={Colors.mutedForeground} />
            <Text style={styles.infoText} numberOfLines={1}>{address}</Text>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.statsRow}>
              <Star size={12} color={Colors.primary} fill={Colors.primary} />
              <Text style={styles.statText}>{ratingDisplay}</Text>
              <View style={styles.statDivider} />
              <Text style={styles.reviewCount}>{reviewsCount} avaliações</Text>
            </View>
            {openHours && (
              <View style={styles.hoursRow}>
                <Clock size={11} color={Colors.mutedForeground} />
                <Text style={styles.hoursText} numberOfLines={1}>{openHours}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Card horizontal compacto para carrossel ──────────────────────────
interface CompactCardProps {
  name: string;
  imageUrl?: string;
  rating: number;
  city?: string;
  isPremium?: boolean;
  index?: number;
  onPress?: () => void;
}

export const CompactBarbershopCard = ({
  name, imageUrl, rating, city, isPremium, index = 0, onPress,
}: CompactCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideX = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(slideX, { toValue: 0, delay, useNativeDriver: true, damping: 18, stiffness: 100, mass: 1 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideX }] }}>
      <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.compactImage} resizeMode="cover" />
        ) : (
          <View style={[styles.compactImage, styles.placeholder]}>
            <Scissors size={28} color={Colors.primary} strokeWidth={1} />
          </View>
        )}
        <View style={styles.compactOverlay} />
        {isPremium && (
          <View style={styles.compactPremium}>
            <Crown size={8} color={Colors.primaryForeground} />
          </View>
        )}
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{name}</Text>
          <View style={styles.compactMeta}>
            <Star size={10} color="#FFD700" fill="#FFD700" />
            <Text style={styles.compactRating}>{rating > 0 ? rating.toFixed(1) : '—'}</Text>
            {city && <Text style={styles.compactCity}>• {city}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Card de corte em destaque ────────────────────────────────────────
interface FeaturedCutProps {
  imageUrl: string;
  caption?: string;
  shopName?: string;
  index?: number;
  onPress?: () => void;
}

export const FeaturedCutCard = ({
  imageUrl, caption, shopName, index = 0, onPress,
}: FeaturedCutProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, delay, useNativeDriver: true, damping: 15, stiffness: 100, mass: 1 }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.cutCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: imageUrl }} style={styles.cutImage} resizeMode="cover" />
        <View style={styles.cutOverlay} />
        <View style={styles.cutInfo}>
          {caption && <Text style={styles.cutCaption} numberOfLines={1}>{caption}</Text>}
          {shopName && (
            <View style={styles.cutShopRow}>
              <Scissors size={9} color={Colors.primary} />
              <Text style={styles.cutShopName} numberOfLines={1}>{shopName}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // ── Card Principal ──
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: Spacing.xs, // Margem interior delicada
    ...Shadows.elegant,
  },
  imageContainer: {
    height: 220, // Altura um pouco maior para valorizar a imagem
    width: '100%',
    borderRadius: Radius.lg, // Imagem também arredondada dentro do card
    overflow: 'hidden',
    position: 'relative',
  },
  image: { height: '100%', width: '100%' },
  placeholder: { backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center' },
  premiumBadge: {
    position: 'absolute', top: Spacing.md, left: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, ...Shadows.gold,
  },
  premiumText: { fontSize: 9, fontWeight: '900', color: Colors.primaryForeground, letterSpacing: 1.5 },
  ratingFloat: {
    position: 'absolute', top: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full,
  },
  ratingFloatText: { fontSize: 13, fontWeight: '900', color: '#FFD700' },
  statusBadge: {
    position: 'absolute', bottom: Spacing.md, right: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
  imageInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.md, paddingTop: Spacing.xxl, backgroundColor: 'rgba(0,0,0,0.6)',
  },
  nameOverImage: { fontSize: 23, fontWeight: '900', color: '#FAFAFA', letterSpacing: 0.5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cityOverImage: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },

  info: { padding: Spacing.md, gap: Spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: Colors.mutedForeground, flex: 1, lineHeight: 18 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  statDivider: { width: 1.5, height: 12, backgroundColor: Colors.border },
  reviewCount: { fontSize: 12, color: Colors.mutedForeground, fontWeight: '500' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursText: { fontSize: 12, color: Colors.mutedForeground, fontWeight: '500' },

  // ── Compact Card ──
  compactCard: {
    width: 160, height: 200, borderRadius: Radius.lg, overflow: 'hidden',
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadows.elegant,
  },
  compactImage: { width: '100%', height: '100%' },
  compactOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  compactPremium: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary, width: 22, height: 22,
    borderRadius: 11, justifyContent: 'center', alignItems: 'center',
  },
  compactInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
  compactName: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  compactRating: { fontSize: 12, fontWeight: '700', color: '#FFD700' },
  compactCity: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  // ── Featured Cut Card ──
  cutCard: {
    width: 130, height: 170, borderRadius: Radius.lg, overflow: 'hidden',
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  cutImage: { width: '100%', height: '100%' },
  cutOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  cutInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8 },
  cutCaption: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  cutShopRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  cutShopName: { fontSize: 10, color: Colors.primary, fontWeight: '600' },
});
