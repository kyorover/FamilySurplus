// src/components/garden/GardenShopModal.tsx
import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_ITEMS } from '../../constants/gardenItems';

interface GardenShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GardenShopModal: React.FC<GardenShopModalProps> = ({ visible, onClose }) => {
  const { settings, updateSettings } = useHesokuriStore();

  if (!settings) return null;

  const currentPoints = settings.gardenPoints || 0;
  const ownedItems = settings.ownedGardenItemIds || [];

  const handlePurchase = (itemId: string, cost: number, name: string) => {
    if (ownedItems.includes(itemId)) {
      Alert.alert('確認', 'このアイテムは既に持っています。');
      return;
    }

    if (currentPoints < cost) {
      Alert.alert('ポイント不足', 'ガーデンポイントが足りません。\n毎日お庭を確認（水やり）してポイントを貯めましょう！');
      return;
    }
    
    Alert.alert(
      'アイテムの交換',
      `${name} を ${cost}pt で交換しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '交換する', 
          onPress: async () => {
            const newSettings = {
              ...settings,
              gardenPoints: currentPoints - cost,
              ownedGardenItemIds: [...ownedItems, itemId]
            };
            await updateSettings(newSettings);
            Alert.alert('交換完了', `${name} を手に入れました！\nお庭の飾り付けに使いましょう！`);
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalCard}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Text style={styles.closeText}>閉じる</Text>
            </TouchableOpacity>
            <Text style={styles.title}>アイテムショップ 🛒</Text>
            <View style={styles.headerBtn} />
          </View>

          <View style={styles.pointDisplay}>
            <Text style={styles.pointLabel}>現在のポイント</Text>
            <Text style={styles.pointValue}>🌱 {currentPoints} pt</Text>
          </View>

          <ScrollView contentContainerStyle={styles.listContent}>
            {GARDEN_ITEMS.map((item) => {
              const isOwned = ownedItems.includes(item.id);
              const canAfford = currentPoints >= item.cost;
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemIconWrap}>
                    <Text style={styles.itemIcon}>{item.imageUrl}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemType}>{item.type === 'flower' ? 'お花' : item.type === 'pot' ? '鉢' : 'オーナメント'}</Text>
                  </View>
                  
                  {isOwned ? (
                    <View style={styles.ownedBadge}>
                      <Text style={styles.ownedText}>所持済</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]} 
                      onPress={() => handlePurchase(item.id, item.cost, item.name)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.buyBtnText, !canAfford && styles.buyBtnTextDisabled]}>{item.cost} pt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { flex: 0.9, backgroundColor: '#F2F2F7', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerBtn: { width: 60 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  closeText: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  
  pointDisplay: { backgroundColor: '#FFFFFF', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  pointLabel: { fontSize: 12, color: '#8E8E93', fontWeight: 'bold', marginBottom: 4 },
  pointValue: { fontSize: 24, fontWeight: '900', color: '#34C759' },

  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  itemIconWrap: { width: 48, height: 48, backgroundColor: '#F2F2F7', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  itemIcon: { fontSize: 24 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 4 },
  itemType: { fontSize: 11, color: '#8E8E93' },
  
  buyBtn: { backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16 },
  buyBtnDisabled: { backgroundColor: '#E5E5EA' },
  buyBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  buyBtnTextDisabled: { color: '#8E8E93' },
  
  ownedBadge: { backgroundColor: '#E8F5E9', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#34C759' },
  ownedText: { color: '#34C759', fontWeight: 'bold', fontSize: 13 }
});