// src/components/garden/GardenInventoryTray.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { UniversalSprite } from './UniversalSprite';

interface Props {
  ownedItems: string[];
  selectedItemId: string | null;
  plantLevel?: number; // HistoryScreenから受け取る（念のためオプショナル）
  onSelectItem: (itemId: string) => void;
}

type CategoryTab = 'ALL' | 'BG' | 'PL' | 'OTHER';

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems, selectedItemId, plantLevel = 1, onSelectItem }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');

  const filteredItems = useMemo(() => {
    return ownedItems.filter(itemId => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'BG') return itemId.startsWith('BG-');
      if (activeTab === 'PL') return itemId.startsWith('PL-');
      return !itemId.startsWith('BG-') && !itemId.startsWith('PL-');
    });
  }, [ownedItems, activeTab]);

  return (
    <View style={styles.inventory}>
      <View style={styles.headerRow}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択</Text>
        <View style={styles.tabContainer}>
          {(['ALL', 'BG', 'PL', 'OTHER'] as CategoryTab[]).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'ALL' ? 'すべて' : tab === 'BG' ? 'タイル' : tab === 'PL' ? '木' : 'その他'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredItems.map((itemId) => {
          // ▼ NaNクラッシュ対策: plantLevelが不正な値でも必ず1以上の数値にする
          const safeLevel = Math.max(1, plantLevel || 1);
          // 現在の育成レベルを正規化してアイコンとして表示する (0始まりのため -1)
          const displayFrameIndex = itemId.startsWith('PL-') 
            ? Math.max(0, Math.min(Math.floor(safeLevel) - 1, 4)) 
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
        {filteredItems.length === 0 && (
          <Text style={styles.emptyText}>アイテムがありません</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inventoryTitle: { fontSize: 12, color: '#666' },
  tabContainer: { flexDirection: 'row' },
  tabBtn: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, backgroundColor: '#F0F0F0', marginLeft: 4 },
  tabBtnActive: { backgroundColor: '#4CAF50' },
  tabText: { fontSize: 10, color: '#666' },
  tabTextActive: { color: '#FFF', fontWeight: 'bold' },
  inventoryItem: { 
    padding: 8, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 8, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: 'transparent',
    // 画像を上下左右中央に配置し、表示の違和感を解消
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 56,
    minHeight: 56
  },
  activeItem: { borderColor: '#4CAF50' },
  emptyText: { color: '#999', paddingVertical: 8 },
});