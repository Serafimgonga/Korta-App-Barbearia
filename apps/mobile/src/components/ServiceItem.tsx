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
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.foreground,
    marginBottom: 6,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 14,
    color: Colors.mutedForeground,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 10,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  bookButtonText: {
    color: Colors.primaryForeground,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
