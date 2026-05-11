import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../theme';
import { Star, MapPin } from 'lucide-react-native';

interface BarbershopCardProps {
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  imageUrl?: string;
  isPremium?: boolean;
  onPress?: () => void;
}

export const BarbershopCard = ({
  name,
  address,
  rating,
  reviewsCount,
  imageUrl,
  isPremium,
  onPress,
}: BarbershopCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Star size={32} color={Colors.mutedForeground} />
          </View>
        )}
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <View style={styles.rating}>
            <Star size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.location}>
          <MapPin size={14} color={Colors.mutedForeground} />
          <Text style={styles.address} numberOfLines={1}>{address}</Text>
        </View>

        <Text style={styles.reviews}>{reviewsCount} avaliações</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.elegant,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    backgroundColor: Colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryForeground,
  },
  info: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.foreground,
    flex: 1,
    marginRight: Spacing.sm,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  reviews: {
    fontSize: 12,
    color: Colors.mutedForeground,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
