// src/components/garden/GardenInventoryTray.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { GardenInventoryItem } from './GardenInventoryItem';
import { useHesokuriStore } from '../../store'; // ▼ 追加: ストアの購読用

interface Props {
  ownedItems: string[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

type CategoryTab = 'ALL' | 'BG' | 'PL' | 'WP' | 'OTHER';

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems: propOwnedItems, selectedItemId, onSelectItem }) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');

  // ▼ 追加: ストアから直接最新状態を購読し、購入後の即時反映を保証する
  const settings = useHesokuriStore(state => state.settings);
  const latestOwnedItems = settings?.ownedGardenItemIds || propOwnedItems;
  const itemCounts = settings?.itemCounts;

  const filteredItems = useMemo(() => {
    if (activeTab === 'WP') {
      return ['WP-NONE', ...latestOwnedItems.filter(id => id.startsWith('WP-'))];
    }
    return latestOwnedItems.filter(itemId => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'BG') return itemId.startsWith('BG-');
      if (activeTab === 'PL') return itemId.startsWith('PL-');
      return !itemId.startsWith('BG-') && !itemId.startsWith('PL-') && !itemId.startsWith('WP-');
    });
  }, [latestOwnedItems, activeTab, itemCounts]); // ▼ 追加: itemCounts の変化でも再計算させる

  return (
    <View style={styles.inventory}>
      <View style={styles.headerRow}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択</Text>
        <View style={styles.tabContainer}>
          {(['ALL', 'BG', 'PL', 'WP', 'OTHER'] as CategoryTab[]).map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'ALL' ? 'すべて' : tab === 'BG' ? 'タイル' : tab === 'PL' ? '木' : tab === 'WP' ? '壁紙' : 'その他'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredItems.map((itemId) => (
          <GardenInventoryItem 
            key={itemId} 
            itemId={itemId} 
            ownedItems={latestOwnedItems} // ▼ 変更: 最新の配列を渡す
            isSelected={selectedItemId === itemId} 
            onSelect={onSelectItem} 
          />
        ))}
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
  emptyText: { color: '#999', paddingVertical: 8 }
});