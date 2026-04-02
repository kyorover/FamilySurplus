// src/components/garden/GardenInventoryTray.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UniversalSprite } from './UniversalSprite';

interface Props {
  ownedItems: string[];
  selectedItemId: string | null;
  plantLevel: number; // ▼ 追加: 外部から現在の知恵の木のレベルを受け取る
  onSelectItem: (itemId: string) => void;
}

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems, selectedItemId, plantLevel, onSelectItem }) => {
  return (
    <View style={styles.inventory}>
      <Text style={styles.inventoryTitle}>配置アイテムを選択（所持品）</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {ownedItems.map((itemId) => {
          // ▼ 修正：キャンバス側の表示仕様と完全に一致させる
          // 賢者の樹(PL-01)は現在の育成レベルを正規化してアイコンとして表示する
          const displayFrameIndex = itemId === 'PL-01' 
            ? Math.max(0, Math.min(Math.floor(plantLevel) - 1, 4)) 
            : 0;

          return (
            <TouchableOpacity
              key={itemId}
              style={[styles.inventoryItem, selectedItemId === itemId && styles.activeItem]}
              onPress={() => onSelectItem(itemId)}
            >
              <UniversalSprite itemId={itemId} frameIndex={displayFrameIndex} displaySize={32} />
            </TouchableOpacity>
          );
        })}
        {ownedItems.length === 0 && (
          <Text style={styles.emptyText}>アイテムがありません</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  inventoryTitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  inventoryItem: { 
    padding: 8, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 8, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: 'transparent',
    // ▼ 追加: 画像を上下左右中央に配置し、違和感を解消
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48
  },
  activeItem: { borderColor: '#4CAF50' },
  emptyText: { color: '#999', paddingVertical: 8 },
});