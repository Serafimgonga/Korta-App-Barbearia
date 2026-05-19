import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, SafeAreaView, Modal
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import { Plus, Scissors, Edit2, Trash2, Clock, DollarSign, X, Save, ToggleLeft, ToggleRight } from 'lucide-react-native';

export default function ServicesScreen() {
  const [shops, setShops]         = useState<any[]>([]);
  const [selectedShop, setSelected] = useState<any>(null);
  const [services, setServices]   = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalVisible, setModal]  = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [saving, setSaving]       = useState(false);

  // Form
  const [svcName, setSvcName]       = useState('');
  const [svcDesc, setSvcDesc]       = useState('');
  const [svcPrice, setSvcPrice]     = useState('');
  const [svcDuration, setSvcDuration] = useState('30');

  useEffect(() => { loadShops(); }, []);
  useEffect(() => { if (selectedShop) loadServices(selectedShop.id); }, [selectedShop]);

  const loadShops = async () => {
    try {
      const data = await BarbershopService.getMyBarbershops();
      const list = Array.isArray(data) ? data : [];
      setShops(list);
      if (list.length > 0) setSelected(list[0]);
    } catch { } finally { setLoading(false); }
  };

  const loadServices = async (shopId: number) => {
    try {
      const data = await BarbershopService.getServices(shopId);
      setServices(Array.isArray(data) ? data : []);
    } catch { setServices([]); }
  };

  const openCreate = () => {
    setEditing(null);
    setSvcName(''); setSvcDesc(''); setSvcPrice(''); setSvcDuration('30');
    setModal(true);
  };

  const openEdit = (svc: any) => {
    setEditing(svc);
    setSvcName(svc.name); setSvcDesc(svc.description || '');
    setSvcPrice(String(svc.price)); setSvcDuration(String(svc.duration_minutes));
    setModal(true);
  };

  const handleSave = async () => {
    if (!svcName || !svcPrice) {
      Alert.alert('Erro', 'Nome e preço são obrigatórios.'); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: svcName, description: svcDesc,
        price: parseFloat(svcPrice), duration_minutes: parseInt(svcDuration),
      };
      if (editing) {
        await BarbershopService.updateService(editing.id, payload);
      } else {
        await BarbershopService.createService(selectedShop.id, payload);
      }
      await loadServices(selectedShop.id);
      setModal(false);
    } catch (e: any) {
      Alert.alert('Erro', e.response?.data?.detail || 'Erro ao guardar serviço.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (svc: any) => {
    try {
      await BarbershopService.updateService(svc.id, { is_active: !svc.is_active });
      await loadServices(selectedShop.id);
    } catch { Alert.alert('Erro', 'Não foi possível alterar o estado.'); }
  };

  const handleDelete = (svc: any) => {
    Alert.alert(
      'Eliminar Serviço',
      `Tens a certeza que queres eliminar "${svc.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await BarbershopService.deleteService(svc.id);
              await loadServices(selectedShop.id);
            } catch { Alert.alert('Erro', 'Não foi possível eliminar.'); }
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  if (shops.length === 0) {
    return (
      <View style={styles.centered}>
        <Scissors size={40} color={Colors.mutedForeground} strokeWidth={1} />
        <Text style={styles.emptyTitle}>Sem barbearias</Text>
        <Text style={styles.emptyDesc}>Cria primeiro a tua barbearia no separador "Minha Loja".</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Seletor de loja */}
      {shops.length > 1 && (
        <View style={styles.shopSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {shops.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.shopTab, selectedShop?.id === s.id && styles.shopTabActive]}
                onPress={() => setSelected(s)}
              >
                <Text style={[styles.shopTabText, selectedShop?.id === s.id && styles.shopTabTextActive]}>{s.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{services.length} serviços</Text>
          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Plus size={16} color={Colors.primaryForeground} />
            <Text style={styles.addBtnText}>Adicionar</Text>
          </TouchableOpacity>
        </View>

        {services.length === 0 ? (
          <View style={styles.emptyCard}>
            <Scissors size={32} color={Colors.mutedForeground} strokeWidth={1} />
            <Text style={styles.emptyTitle}>Sem serviços</Text>
            <Text style={styles.emptyDesc}>Adiciona os teus primeiros serviços para receber marcações.</Text>
          </View>
        ) : (
          services.map((svc) => (
            <View key={svc.id} style={[styles.serviceCard, !svc.is_active && styles.serviceCardInactive]}>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                  <Text style={[styles.serviceName, !svc.is_active && styles.textInactive]}>{svc.name}</Text>
                  <Text style={styles.servicePrice}>{svc.price?.toLocaleString('pt-AO')} Kz</Text>
                </View>
                {svc.description && (
                  <Text style={styles.serviceDesc} numberOfLines={2}>{svc.description}</Text>
                )}
                <View style={styles.serviceMeta}>
                  <Clock size={12} color={Colors.mutedForeground} />
                  <Text style={styles.serviceMetaText}>{svc.duration_minutes} min</Text>
                  {!svc.is_active && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>INATIVO</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.serviceActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggle(svc)}>
                  {svc.is_active
                    ? <ToggleRight size={22} color={Colors.success} />
                    : <ToggleLeft size={22} color={Colors.mutedForeground} />
                  }
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(svc)}>
                  <Edit2 size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(svc)}>
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Criar/Editar */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editing ? 'Editar Serviço' : 'Novo Serviço'}</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <X size={24} color={Colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Scissors size={18} color={Colors.mutedForeground} />
              <TextInput
                style={styles.input} placeholder="Nome do serviço *"
                value={svcName} onChangeText={setSvcName}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descrição do serviço"
              value={svcDesc} onChangeText={setSvcDesc}
              multiline numberOfLines={3}
              placeholderTextColor={Colors.mutedForeground}
            />

            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <DollarSign size={18} color={Colors.mutedForeground} />
                <TextInput
                  style={styles.input} placeholder="Preço (Kz) *"
                  value={svcPrice} onChangeText={setSvcPrice} keyboardType="numeric"
                  placeholderTextColor={Colors.mutedForeground}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Clock size={18} color={Colors.mutedForeground} />
                <TextInput
                  style={styles.input} placeholder="Duração (min)"
                  value={svcDuration} onChangeText={setSvcDuration} keyboardType="numeric"
                  placeholderTextColor={Colors.mutedForeground}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={Colors.primaryForeground} /> : (
                <>
                  <Save size={18} color={Colors.primaryForeground} />
                  <Text style={styles.saveBtnText}>{editing ? 'Guardar Alterações' : 'Criar Serviço'}</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl, gap: 12 },
  shopSelector: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  shopTab: {
    paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  shopTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  shopTabText: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  shopTabTextActive: { color: Colors.primaryForeground },

  list: { padding: Spacing.xl, gap: Spacing.sm },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  listTitle: { fontSize: 13, color: Colors.mutedForeground, fontWeight: '600' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 8, ...Shadows.gold,
  },
  addBtnText: { fontSize: 13, fontWeight: '800', color: Colors.primaryForeground },

  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: Spacing.xxl },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.foreground },
  emptyDesc: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center' },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  serviceCardInactive: { opacity: 0.6 },
  serviceInfo: { flex: 1 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { fontSize: 16, fontWeight: '800', color: Colors.foreground, flex: 1, marginRight: 8 },
  textInactive: { color: Colors.mutedForeground },
  servicePrice: { fontSize: 16, fontWeight: '900', color: Colors.primary },
  serviceDesc: { fontSize: 13, color: Colors.mutedForeground, marginTop: 4, lineHeight: 18 },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  serviceMetaText: { fontSize: 12, color: Colors.mutedForeground },
  inactiveBadge: {
    backgroundColor: Colors.surface2, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.full, marginLeft: 8,
  },
  inactiveBadgeText: { fontSize: 9, fontWeight: '900', color: Colors.mutedForeground, letterSpacing: 1 },
  serviceActions: { flexDirection: 'row', gap: 4, marginLeft: 8 },
  actionBtn: { padding: 6 },

  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: Colors.primary },
  modalForm: { padding: Spacing.xl, gap: Spacing.md },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, minHeight: 52,
  },
  input: { flex: 1, fontSize: 15, color: Colors.foreground, paddingVertical: Spacing.sm },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, padding: Spacing.md, minHeight: 80, textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, ...Shadows.gold,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: Colors.primaryForeground },
});
