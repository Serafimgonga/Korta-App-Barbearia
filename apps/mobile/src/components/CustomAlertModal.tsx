import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { useAlertStore } from '../store/alert';
import { Radius, Spacing } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CustomAlertModal() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Se não houver botões especificados, fornece um botão de fecho padrão "OK"
  const activeButtons = buttons.length > 0 
    ? buttons 
    : [{ text: 'OK', onPress: () => {} }];

  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      // Pequeno timeout para dar tempo ao modal de fechar antes de disparar a ação seguinte
      setTimeout(() => {
        onPress();
      }, Platform.OS === 'ios' ? 100 : 0);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <TouchableWithoutFeedback onPress={hideAlert}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              styles.cardWrapper,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}>
              {/* Amber glow line on top */}
              <View style={styles.glowLine} />

              <View style={styles.alertCard}>
                {/* Header / Title */}
                <Text style={styles.title}>{title}</Text>

                {/* Thin divider */}
                <View style={styles.divider} />

                {/* Message */}
                {!!message && <Text style={styles.message}>{message}</Text>}

                {/* Action Buttons */}
                <View style={[
                  styles.buttonContainer,
                  // Stack vertically if more than 2 buttons OR any button text is long
                  (activeButtons.length > 2 || activeButtons.some(b => b.text.length > 12))
                    ? styles.buttonContainerVertical
                    : styles.buttonContainerHorizontal
                ]}>
                  {activeButtons.map((btn, index) => {
                    const isCancel = btn.style === 'cancel' || btn.text.toLowerCase() === 'cancelar' || btn.text.toLowerCase().includes('navegar') || btn.text.toLowerCase().includes('ignorar') || btn.text.toLowerCase().includes('percebido');
                    const isDestructive = btn.style === 'destructive' || btn.text.toLowerCase() === 'recusar' || btn.text.toLowerCase() === 'eliminar';
                    const useVertical = activeButtons.length > 2 || activeButtons.some(b => b.text.length > 12);
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.button,
                          useVertical ? styles.buttonFullWidth : styles.buttonHalfWidth,
                          isCancel && styles.buttonCancel,
                          isDestructive && styles.buttonDestructive,
                          !isCancel && !isDestructive && styles.buttonPrimary
                        ]}
                        activeOpacity={0.85}
                        onPress={() => handleButtonPress(btn.onPress)}
                      >
                        <Text style={[
                          styles.buttonText,
                          isCancel && styles.buttonTextCancel,
                          isDestructive && styles.buttonTextDestructive,
                          !isCancel && !isDestructive && styles.buttonTextPrimary
                        ]}>
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  cardWrapper: {
    width: Platform.OS === 'web' ? Math.min(width * 0.9, 420) : '90%',
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  glowLine: {
    height: 3,
    backgroundColor: '#f59e0b',
  },
  alertCard: {
    backgroundColor: '#18181B', // Zinc-900
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#27272A', // Zinc-800
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: '#f59e0b',
    borderRadius: 1,
    marginVertical: Spacing.md,
    opacity: 0.6,
  },
  message: {
    fontSize: 14,
    color: '#a1a1aa', // Zinc-400
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.sm + 2,
  },
  buttonContainerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonHalfWidth: {
    flex: 1,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonPrimary: {
    backgroundColor: '#f59e0b', // Amber
  },
  buttonCancel: {
    backgroundColor: '#27272A', // Zinc-800
    borderWidth: 1.5,
    borderColor: '#3f3f46', // Zinc-700
  },
  buttonDestructive: {
    backgroundColor: '#7f1d1d', // Red-900 tone
    borderWidth: 1.5,
    borderColor: '#ef4444',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonTextPrimary: {
    color: '#000000',
  },
  buttonTextCancel: {
    color: '#a1a1aa', // Zinc-400
  },
  buttonTextDestructive: {
    color: '#fca5a5', // Red-300
  },
});
