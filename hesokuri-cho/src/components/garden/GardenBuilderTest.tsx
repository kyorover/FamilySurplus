// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenPlacement } from '../../types';
import { useHesokuriStore } from '../../store';
import { UniversalSprite } from './UniversalSprite';

/**
 * 開発・動作確認用：ストアと連動したアイテム購入＆配置テストコンポーネント
 */
export const GardenBuilderTest: React.FC = () => {
  const { settings } = useHesokuriStore();
  
  // 配置データはローカルステートで一時管理（本番ではMonthlyGarden等に保存）
  const [placements, setPlacements] = useState<GardenPlacement[]>([
    { itemId: 'PL-01', x: 2, y: 2 } // デフォルト配置
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭づくりテスト</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
          <Text style={styles.shopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <IsometricGardenCanvas placements={placements} onPressTile={handlePressTile} />

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