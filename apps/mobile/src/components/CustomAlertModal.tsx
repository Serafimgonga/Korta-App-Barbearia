import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useAlertStore } from '../store/alert';
import { Colors, Radius, Spacing } from '../theme';

const { width } = Dimensions.get('window');

export default function CustomAlertModal() {
  const { visible, title, message, buttons, hideAlert } = useAlertStore();

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
            <View style={styles.alertCard}>
              {/* Header / Title */}
              <Text style={styles.title}>{title}</Text>

              {/* Message */}
              {!!message && <Text style={styles.message}>{message}</Text>}

              {/* Action Buttons */}
              <View style={[
                styles.buttonContainer,
                activeButtons.length > 2 ? styles.buttonContainerVertical : styles.buttonContainerHorizontal
              ]}>
                {activeButtons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel' || btn.text.toLowerCase() === 'cancelar';
                  const isDestructive = btn.style === 'destructive' || btn.text.toLowerCase() === 'recusar' || btn.text.toLowerCase() === 'eliminar';
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        activeButtons.length > 2 ? styles.buttonFullWidth : styles.buttonHalfWidth,
                        isCancel && styles.buttonCancel,
                        isDestructive && styles.buttonDestructive,
                        !isCancel && !isDestructive && styles.buttonPrimary
                      ]}
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Deep backdrop dim
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  alertCard: {
    width: Platform.OS === 'web' ? Math.min(width * 0.9, 420) : '90%',
    backgroundColor: Colors.surface, // '#1C1C1C'
    borderRadius: Radius.lg, // 14px
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary, // Gold
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 14,
    color: '#E5E5E5', // Soft near white message text
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  buttonContainerHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainerVertical: {
    flexDirection: 'column',
  },
  button: {
    height: 48,
    borderRadius: Radius.md,
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
    backgroundColor: Colors.primary, // Gold
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDestructive: {
    backgroundColor: Colors.error, // Red
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonTextPrimary: {
    color: Colors.primaryForeground, // Deep Black
  },
  buttonTextCancel: {
    color: Colors.mutedForeground,
  },
  buttonTextDestructive: {
    color: '#FFF',
  },
});
