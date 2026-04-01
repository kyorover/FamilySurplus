// src/components/garden/GardenShopModal.tsx
import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_ITEMS } from '../../constants/gardenItems';
import { UniversalSprite } from './UniversalSprite';

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
      Alert.alert('ポイント不足', 'ガーデンポイントが足りません。\n水やりをしてポイントを貯めましょう！');
      return;
    }
    
    Alert.alert(
      'アイテムの交換',
      `${name} を ${cost}pt で交換しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '交換', 
          onPress: () => {
            updateSettings({
              ...settings,
              gardenPoints: currentPoints - cost,
              ownedGardenItemIds: [...ownedItems, itemId]
            });
            Alert.alert('完了', `${name} を獲得しました！`);
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>ガーデンショップ</Text>
          <View style={styles.pointContainer}>
            <Text style={styles.pointLabel}>所持ポイント</Text>
            <Text style={styles.pointValue}>{currentPoints} pt</Text>
          </View>

          <ScrollView contentContainerStyle={styles.listContent}>
            {GARDEN_ITEMS.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemIconWrap}>
                  <UniversalSprite itemId={item.id} frameIndex={0} displaySize={40} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCost}>{item.cost} pt</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.buyBtn, ownedItems.includes(item.id) && styles.buyBtnDisabled]} 
                  onPress={() => handlePurchase(item.id, item.cost, item.name)}
                  disabled={ownedItems.includes(item.id)}
                >
                  <Text style={styles.buyBtnText}>
                    {ownedItems.includes(item.id) ? '所持済' : '交換'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20 // SafeAreaViewの代替として上部余白を確保
  },
  modalContainer: { backgroundColor: '#FFF', margin: 20, borderRadius: 16, flex: 1, maxHeight: '80%', overflow: 'hidden' },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 16 },
  pointContainer: { alignItems: 'center', marginBottom: 16 },
  pointLabel: { fontSize: 12, color: '#666' },
  pointValue: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  listContent: { paddingHorizontal: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  itemIconWrap: { width: 50, alignItems: 'center' },
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold' },
  itemCost: { fontSize: 14, color: '#666' },
  buyBtn: { backgroundColor: '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  buyBtnDisabled: { backgroundColor: '#CCC' },
  buyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  closeBtn: { margin: 16, backgroundColor: '#9E9E9E', padding: 12, borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontWeight: 'bold' }
});