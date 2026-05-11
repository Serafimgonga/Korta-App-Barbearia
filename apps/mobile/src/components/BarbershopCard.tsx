import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
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
            <Star size={32} color={Colors.gray[400]} />
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
            <Star size={14} color={Colors.secondary} fill={Colors.secondary} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>

        <View style={styles.location}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.address} numberOfLines={1}>{address}</Text>
        </View>

        <Text style={styles.reviews}>{reviewsCount} avaliações</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
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
    color: Colors.text,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reviews: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
