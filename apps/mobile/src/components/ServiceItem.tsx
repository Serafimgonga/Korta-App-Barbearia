import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
import { Clock } from 'lucide-react-native';

interface ServiceItemProps {
  name: string;
  price: number;
  duration: number;
  onPress?: () => void;
}

export const ServiceItem = ({ name, price, duration, onPress }: ServiceItemProps) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.durationContainer}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.durationText}>{duration} min</Text>
        </View>
      </View>
      
      <View style={styles.right}>
        <Text style={styles.price}>
          {price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
        </Text>
        <TouchableOpacity style={styles.bookButton} onPress={onPress}>
          <Text style={styles.bookButtonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  bookButtonText: {
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});
