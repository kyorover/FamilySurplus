// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenPlacement } from '../../types';
import { useHesokuriStore } from '../../store';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';

export const GardenBuilderTest: React.FC = () => {
  const { settings } = useHesokuriStore();
  
  const [placements, setPlacements] = useState<GardenPlacement[]>([
    { itemId: 'PL-01', x: 2, y: 2 } 
  ]);
  
  const [isShopVisible, setShopVisible] = useState(false);
  const [selectedItemIdToPlace, setSelectedItemIdToPlace] = useState<string | null>(null);

  // AsyncStorageに残っている古いテストデータ（item_flower_01等）をフィルタリングして除外
  const ownedItems = (settings?.ownedGardenItemIds || []).filter(itemId => SPRITE_CONFIG[itemId]);

  const handlePressTile = (x: number, y: number) => {
    if (!selectedItemIdToPlace) {
      Alert.alert('案内', '下のリストから配置したいアイテムを選択してから、お庭をタップしてください。');
      return;
    }

    const isOccupied = placements.some(p => p.x === x && p.y === y);
    if (isOccupied) {
      Alert.alert('配置不可', 'そのマスには既にアイテムがあります。空いているマスをタップしてください。');
      return;
    }

    setPlacements(prev => [...prev, { itemId: selectedItemIdToPlace, x, y }]);
    setSelectedItemIdToPlace(null);
  };

  const handleMoveItem = (index: number, newX: number, newY: number) => {
    // 盤面外に出た場合はキャンセル
    if (newX < 0 || newX >= GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY >= GARDEN_CONFIG.GRID_SIZE) {
      Alert.alert('移動キャンセル', 'お庭の枠外には配置できません。');
      return;
    }

    // 他アイテムとの衝突判定
    const isOccupied = placements.some((p, i) => i !== index && p.x === newX && p.y === newY);
    if (isOccupied) {
      Alert.alert('移動キャンセル', '移動先のマスには既に他のアイテムがあります。');
      return;
    }

    // 正常に移動
    setPlacements(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], x: newX, y: newY };
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭づくりテスト</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
          <Text style={styles.shopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <IsometricGardenCanvas 
        placements={placements} 
        onPressTile={handlePressTile} 
        onMoveItem={handleMoveItem}
      />

      <View style={styles.inventory}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択（所持品）</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ownedItems.map((itemId) => (
            <TouchableOpacity
              key={itemId}
              style={[styles.inventoryItem, itemId === selectedItemIdToPlace && styles.activeItem]}
              onPress={() => setSelectedItemIdToPlace(itemId)}
            >
              <UniversalSprite itemId={itemId} frameIndex={0} displaySize={32} />
            </TouchableOpacity>
          ))}
          {ownedItems.length === 0 && (
            <Text style={styles.emptyText}>ショップでアイテムを購入してください</Text>
          )}
        </ScrollView>
      </View>

      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  shopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  shopBtnText: { color: '#FFF', fontWeight: 'bold' },
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  inventoryTitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  inventoryItem: { padding: 8, backgroundColor: '#E0E0E0', borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  activeItem: { borderColor: '#4CAF50' },
  emptyText: { color: '#999', paddingVertical: 8 }
});