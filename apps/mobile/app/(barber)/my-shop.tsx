import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../src/theme';
import { BarbershopService } from '../../src/services/barbershops';
import { useBarberStore } from '../../src/store/barber';
import ShopSelectorHeader from '../../src/components/ShopSelectorHeader';
import {
  Store, MapPin, Phone, Clock, Save, Plus,
  CheckCircle, XCircle, PauseCircle
} from 'lucide-react-native';

type Status = 'open' | 'closed' | 'paused';

const STATUS_OPTIONS: { value: Status; label: string; icon: any; color: string }[] = [
  { value: 'open',   label: 'Aberto',   icon: CheckCircle, color: '#34D399' },
  { value: 'paused', label: 'Pausado',  icon: PauseCircle, color: '#F59E0B' },
  { value: 'closed', label: 'Fechado',  icon: XCircle,     color: '#EF4444' },
];

export default function MyShopScreen() {
  const { shops, activeShop, loadShops, refreshShops, loading } = useBarberStore();
  const [creating, setCreating]   = useState(false);
  const [saving, setSaving]       = useState(false);

  // Form state
  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [address, setAddress]     = useState('');
  const [city, setCity]           = useState('');
  const [province, setProvince]   = useState('Luanda');
  const [phone, setPhone]         = useState('');
  const [whatsapp, setWhatsapp]   = useState('');
  const [openHours, setOpenHours] = useState('Seg-Sáb: 08:00 - 20:00');
  const [status, setStatus]       = useState<Status>('open');

  useEffect(() => {
    loadShops();
  }, []);

  // Update form fields when activeShop changes
  useEffect(() => {
    if (activeShop && !creating) {
      setName(activeShop.name || '');
      setDesc(activeShop.description || '');
      setAddress(activeShop.address || '');
      setCity(activeShop.city || '');
      setProvince(activeShop.province || 'Luanda');
      setPhone(activeShop.phone || '');
      setWhatsapp(activeShop.whatsapp || '');
      setOpenHours(activeShop.open_hours || '');
      setStatus(activeShop.status as Status || 'open');
    }
  }, [activeShop, creating]);

  const startCreating = () => {
    setCreating(true);
    setName(''); setDesc(''); setAddress(''); setCity('');
    setProvince('Luanda'); setPhone(''); setWhatsapp('');
    setOpenHours('Seg-Sáb: 08:00 - 20:00'); setStatus('open');
  };

  const handleSave = async () => {
    if (!name || !address || !city) {
      Alert.alert('Erro', 'Nome, morada e cidade são obrigatórios.');
      return;
    }
    setSaving(true);
    try {
      const payload = { name, description, address, city, province, phone, whatsapp, open_hours: openHours, status };
      if (creating || !activeShop) {
        const newShop = await BarbershopService.create(payload);
        Alert.alert('✅ Criada!', 'A tua barbearia foi criada com sucesso.');
        setCreating(false);
        // Auto-select the newly created shop
        await useBarberStore.getState().setActiveShop(newShop);
      } else {
        await BarbershopService.update(activeShop.id, payload);
        Alert.alert('✅ Guardado!', 'As alterações foram guardadas.');
      }
      await refreshShops();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro', e.response?.data?.detail || 'Erro ao guardar.');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Seletor de barbearia */}
        <ShopSelectorHeader
          showCreateOption
          onCreatePress={startCreating}
          isCreating={creating}
        />

        {/* Formulário */}
        <View style={styles.form}>
          {shops.length === 0 && (
            <View style={styles.emptyNotice}>
              <Store size={32} color={Colors.primary} />
              <Text style={styles.emptyTitle}>Cria a tua primeira barbearia</Text>
              <Text style={styles.emptyDesc}>Preenche os dados abaixo para aparecer na plataforma KORTA.</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>INFORMAÇÃO BÁSICA</Text>

          <View style={styles.inputGroup}>
            <Store size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.input} placeholder="Nome da barbearia *"
              value={name} onChangeText={setName}
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrição (o que vos distingue?)"
            value={description} onChangeText={setDesc}
            multiline numberOfLines={3}
            placeholderTextColor={Colors.mutedForeground}
          />

          <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>LOCALIZAÇÃO</Text>

          <View style={styles.inputGroup}>
            <MapPin size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.input} placeholder="Morada completa *"
              value={address} onChangeText={setAddress}
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput
                style={styles.input} placeholder="Cidade *"
                value={city} onChangeText={setCity}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <TextInput
                style={styles.input} placeholder="Província"
                value={province} onChangeText={setProvince}
                placeholderTextColor={Colors.mutedForeground}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>CONTACTOS</Text>

          <View style={styles.inputGroup}>
            <Phone size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.input} placeholder="Telefone"
              value={phone} onChangeText={setPhone} keyboardType="phone-pad"
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <View style={styles.inputGroup}>
            <Phone size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.input} placeholder="WhatsApp"
              value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad"
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>HORÁRIO</Text>

          <View style={styles.inputGroup}>
            <Clock size={18} color={Colors.mutedForeground} />
            <TextInput
              style={styles.input} placeholder="Ex: Seg-Sáb: 08:00 - 20:00"
              value={openHours} onChangeText={setOpenHours}
              placeholderTextColor={Colors.mutedForeground}
            />
          </View>

          {/* Status */}
          {!creating && activeShop && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>ESTADO</Text>
              <View style={styles.statusRow}>
                {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.statusBtn, status === value && { borderColor: color, backgroundColor: color + '22' }]}
                    onPress={() => setStatus(value)}
                  >
                    <Icon size={16} color={status === value ? color : Colors.mutedForeground} />
                    <Text style={[styles.statusLabel, status === value && { color }]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Guardar */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.primaryForeground} />
            ) : (
              <>
                <Save size={18} color={Colors.primaryForeground} />
                <Text style={styles.saveBtnText}>
                  {creating || !activeShop ? 'Criar Barbearia' : 'Guardar Alterações'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopSelector: {
    padding: Spacing.md, paddingBottom: 0,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  shopTab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  shopTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  shopTabText: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  shopTabTextActive: { color: Colors.primaryForeground },

  form: { padding: Spacing.xl, gap: Spacing.sm },
  sectionLabel: {
    fontSize: 10, fontWeight: '900', color: Colors.primary,
    letterSpacing: 2, marginBottom: 4,
  },
  inputGroup: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, minHeight: 52,
  },
  input: { flex: 1, fontSize: 15, color: Colors.foreground, paddingVertical: Spacing.sm },
  textArea: {
    backgroundColor: Colors.surface, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, minHeight: 80, textAlignVertical: 'top',
  },
  statusRow: { flexDirection: 'row', gap: Spacing.sm },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusLabel: { fontSize: 13, fontWeight: '700', color: Colors.mutedForeground },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: Spacing.md + 4, marginTop: Spacing.lg, ...Shadows.gold,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: Colors.primaryForeground },
  emptyNotice: { alignItems: 'center', gap: 8, marginBottom: Spacing.xl, paddingVertical: Spacing.xl },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.foreground },
  emptyDesc: { fontSize: 14, color: Colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
});
