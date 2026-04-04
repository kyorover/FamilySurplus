// src/components/garden/GardenInventoryTray.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';
import { useHesokuriStore } from '../../store';

interface Props {
  ownedItems: string[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

type CategoryTab = 'ALL' | 'BG' | 'PL' | 'WP' | 'OTHER';

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems, selectedItemId, onSelectItem }) => {
  const { settings } = useHesokuriStore();
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');

  const filteredItems = useMemo(() => {
    if (activeTab === 'WP') {
      return ['WP-NONE', ...ownedItems.filter(id => id.startsWith('WP-'))];
    }
    return ownedItems.filter(itemId => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'BG') return itemId.startsWith('BG-');
      if (activeTab === 'PL') return itemId.startsWith('PL-');
      return !itemId.startsWith('BG-') && !itemId.startsWith('PL-') && !itemId.startsWith('WP-');
    });
  }, [ownedItems, activeTab]);

  const getItemBackgroundColor = (itemId: string) => {
    if (itemId === 'WP-NONE') return '#E0F7FA';
    const master = ALL_GARDEN_ITEMS.find(i => i.id === itemId);
    if (!master) return '#E0E0E0';
    switch (master.type) {
      case 'bg': return '#E3F2FD';
      case 'plant': return '#E8F5E9';
      case 'ornament': return '#FFF3E0';
      case 'flower': return '#FCE4EC';
      case 'pot': return '#EFEBE9';
      default: return '#E0E0E0';
    }
  };

  // 在庫数の計算（総所持数 - 配置済みの数）
  const getRemainingStock = (itemId: string) => {
    if (itemId === 'WP-NONE' || itemId.startsWith('WP-')) return 1; // 壁紙は常に1扱いで制限なし
    if (itemId.startsWith('BG-')) return 99; // タイルは配置自由の仕様を維持（制限する場合はここを変更）
    
    const totalOwned = settings?.itemCounts?.[itemId] || (ownedItems.includes(itemId) ? 1 : 0);
    const placedCount = settings?.gardenPlacements?.filter(p => p.itemId === itemId).length || 0;
    
    return Math.max(0, totalOwned - placedCount);
  };

  const handleSelect = (itemId: string) => {
    const stock = getRemainingStock(itemId);
    if (stock <= 0 && !itemId.startsWith('WP-') && !itemId.startsWith('BG-')) {
      Alert.alert('在庫不足', '配置できる在庫がありません。\nショップで追加交換してください。');
      return;
    }
    onSelectItem(itemId);
  };

  return (
    <View style={styles.inventory}>
      <View style={styles.headerRow}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択</Text>
        <View style={styles.tabContainer}>
          {(['ALL', 'BG', 'PL', 'WP', 'OTHER'] as CategoryTab[]).map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'ALL' ? 'すべて' : tab === 'BG' ? 'タイル' : tab === 'PL' ? '木' : tab === 'WP' ? '壁紙' : 'その他'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredItems.map((itemId) => {
          if (itemId === 'WP-NONE') {
            return (
              <TouchableOpacity
                key={itemId}
                style={[styles.inventoryItem, selectedItemId === itemId && styles.activeItem, { backgroundColor: getItemBackgroundColor(itemId) }]}
                onPress={() => handleSelect(itemId)}
              >
                <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>None</Text>
              </TouchableOpacity>
            );
          }

          const isPlant = itemId.startsWith('PL-');
          const isBgOrWp = itemId.startsWith('BG-') || itemId.startsWith('WP-');
          const itemLevel = settings?.itemLevels?.[itemId] || (itemId === 'PL-01' ? settings?.plantLevel : 1) || 1;
          const safeLevel = Math.max(1, itemLevel);
          const displayFrameIndex = isPlant ? Math.max(0, Math.min(Math.floor(safeLevel) - 1, 4)) : 0;
          
          const stock = getRemainingStock(itemId);
          const isOutOfStock = stock <= 0 && !isBgOrWp;

          return (
            <TouchableOpacity
              key={itemId}
              style={[
                styles.inventoryItem, 
                selectedItemId === itemId && styles.activeItem,
                isOutOfStock && styles.outOfStockItem,
                { backgroundColor: getItemBackgroundColor(itemId) }
              ]}
              onPress={() => handleSelect(itemId)}
            >
              <View style={isOutOfStock ? { opacity: 0.4 } : {}}>
                <UniversalSprite itemId={itemId} frameIndex={displayFrameIndex} displaySize={32} />
              </View>
              
              {isPlant && (
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>Lv.{safeLevel}</Text>
                </View>
              )}

              {/* 在庫数バッジ */}
              {!isBgOrWp && (
                <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeZero]}>
                  <Text style={styles.stockBadgeText}>x{stock}</Text>
                </View>
              )}
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
    borderRadius: 8, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: 'transparent',
    justifyContent: 'center', 
    alignItems: 'center',
    minWidth: 56,
    minHeight: 56,
    position: 'relative'
  },
  activeItem: { borderColor: '#4CAF50' },
  outOfStockItem: { borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' },
  emptyText: { color: '#999', paddingVertical: 8 },
  levelBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#FF9800',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  levelBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  stockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#1976D2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  stockBadgeZero: { backgroundColor: '#9E9E9E' },
  stockBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
});