import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, ScrollView, Pressable } from 'react-native';
import { Colors, Spacing, Radius } from '../theme';
import { useBarberStore, Shop } from '../store/barber';
import { ChevronDown, ChevronsUpDown, Check, Plus } from 'lucide-react-native';

interface ShopSelectorHeaderProps {
  showCreateOption?: boolean;
  onCreatePress?: () => void;
  isCreating?: boolean;
}

export default function ShopSelectorHeader({
  showCreateOption = false,
  onCreatePress,
  isCreating = false,
}: ShopSelectorHeaderProps) {
  const { shops, activeShop, loading, initialized, loadShops, setActiveShop } = useBarberStore();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadShops();
    }
  }, [initialized]);

  const getInitials = (name: string) => {
    if (!name) return 'KB';
    return name
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleSelectShop = async (shop: Shop) => {
    setModalVisible(false);
    await setActiveShop(shop);
  };

  const handleCreatePress = () => {
    setModalVisible(false);
    if (onCreatePress) {
      onCreatePress();
    }
  };

  if (loading && !initialized) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} size="small" />
      </View>
    );
  }

  if (shops.length === 0 && !showCreateOption) {
    return null;
  }

  // Determine avatar colors based on shop id or state
  const isShopSelected = activeShop && !isCreating;
  const avatarBg = isShopSelected ? '#EDE9FE' : '#F1EFE8';
  const avatarTextColor = isShopSelected ? '#5B21B6' : '#5F5E5A';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarTextColor }]}>
            {isCreating ? '➕' : getInitials(activeShop?.name || '')}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {isCreating ? 'Nova Barbearia' : activeShop?.name || 'Selecionar Barbearia'}
          </Text>
          <View style={styles.roleContainer}>
            <Text style={styles.role}>
              {isCreating ? 'modo de criação' : 'barbearia activa'}
            </Text>
            <ChevronDown size={12} color={Colors.mutedForeground} style={styles.chevronInline} />
          </View>
        </View>

        <ChevronsUpDown size={18} color={Colors.mutedForeground} />
      </TouchableOpacity>

      {/* Switcher Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.dismissOverlay} onPress={() => setModalVisible(false)} />
          
          <View style={styles.sheetContainer}>
            {/* Grabber indicator for sheet */}
            <View style={styles.grabber} />
            
            <Text style={styles.sheetTitle}>Trocar barbearia</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetList}>
              {shops.map((shop) => {
                const isActive = !isCreating && activeShop?.id === shop.id;
                const initials = getInitials(shop.name);
                
                // Variar cores de avatar para estilo visual premium
                const itemBgColor = isActive ? '#EDE9FE' : '#E1F5EE';
                const itemTextColor = isActive ? '#5B21B6' : '#0F6E56';

                return (
                  <TouchableOpacity
                    key={shop.id}
                    style={[styles.shopOption, isActive && styles.shopOptionActive]}
                    onPress={() => handleSelectShop(shop)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.optionAvatar, { backgroundColor: itemBgColor }]}>
                      <Text style={[styles.optionAvatarText, { color: itemTextColor }]}>
                        {initials}
                      </Text>
                    </View>
                    
                    <View style={styles.optionInfo}>
                      <Text style={styles.optionName} numberOfLines={1}>{shop.name}</Text>
                      <Text style={styles.optionSub}>{shop.city || 'Ícolo e Bengo'}</Text>
                    </View>

                    {isActive && <Check size={18} color="#6C5CE7" style={styles.checkIcon} />}
                  </TouchableOpacity>
                );
              })}

              {showCreateOption && onCreatePress && (
                <TouchableOpacity
                  style={styles.addShopBtn}
                  onPress={handleCreatePress}
                  activeOpacity={0.7}
                >
                  <Plus size={16} color={Colors.primary} />
                  <Text style={styles.addShopText}>Adicionar barbearia</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  role: {
    fontSize: 11,
    color: Colors.mutedForeground,
  },
  chevronInline: {
    marginTop: 1,
  },
  loader: {
    padding: Spacing.md,
    alignItems: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dismissOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    maxHeight: '75%',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginVertical: 10,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
    marginBottom: Spacing.md,
  },
  sheetList: {
    gap: 8,
  },
  shopOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  shopOptionActive: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  optionAvatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionAvatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  optionInfo: {
    flex: 1,
    minWidth: 0,
  },
  optionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.foreground,
  },
  optionSub: {
    fontSize: 11,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: 'auto',
    color: Colors.primary,
  },
  addShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(212, 175, 55, 0.4)',
    marginTop: 4,
  },
  addShopText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
