// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenPlacement } from '../../types';
import { useHesokuriStore } from '../../store';
import { UniversalSprite } from './UniversalSprite';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';

/**
 * 開発・動作確認用：ストアと連動したアイテム購入＆配置テストコンポーネント
 */
export const GardenBuilderTest: React.FC = () => {
  const { settings } = useHesokuriStore();
  
  const [placements, setPlacements] = useState<GardenPlacement[]>([
    { itemId: 'PL-01', x: 2, y: 2 } 
  ]);
  
  const [isShopVisible, setShopVisible] = useState(false);
  const [selectedItemIdToPlace, setSelectedItemIdToPlace] = useState<string | null>(null);

  const ownedItems = settings?.ownedGardenItemIds || [];

  const handlePressTile = (x: number, y: number) => {
    if (!selectedItemIdToPlace) {
      Alert.alert('案内', '下のリストから配置したいアイテムを選択してください。');
      return;
    }

    const isOccupied = placements.some(p => p.x === x && p.y === y);
    if (isOccupied) {
      Alert.alert('エラー', 'そのマスには既にアイテムがあります。');
      return;
    }

    setPlacements(prev => [...prev, { itemId: selectedItemIdToPlace, x, y }]);
    setSelectedItemIdToPlace(null);
  };

  // ドラッグ＆ドロップによる移動ハンドラ
  const handleMoveItem = (index: number, newX: number, newY: number) => {
    // 盤面外にドロップされた場合は元の位置に戻す（何もしない）
    if (newX < 0 || newX >= GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY >= GARDEN_CONFIG.GRID_SIZE) {
      return;
    }

    // 他のアイテムとの衝突判定（自分自身は除外）
    const isOccupied = placements.some((p, i) => i !== index && p.x === newX && p.y === newY);
    if (isOccupied) {
      // 衝突した場合は元の位置に戻る
      return;
    }

    // 配置を更新
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
        onMoveItem={handleMoveItem} // 追加
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