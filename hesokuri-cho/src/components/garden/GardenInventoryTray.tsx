// src/components/garden/GardenInventoryTray.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';
import { SPRITE_CONFIG } from '../../config/spriteConfig';
import { useHesokuriStore } from '../../store';
import { InventoryTabs, CategoryTab } from './InventoryTabs';

interface Props { ownedItems: string[]; selectedItemId: string | null; onSelectItem: (itemId: string) => void; }

export const GardenInventoryTray: React.FC<Props> = ({ ownedItems, selectedItemId, onSelectItem }) => {
  const { settings } = useHesokuriStore();
  const [activeTab, setActiveTab] = useState<CategoryTab>('ALL');

  const filteredItems = useMemo(() => {
    if (activeTab === 'WP') return ['WP-NONE', ...ownedItems.filter(id => id.startsWith('WP-'))];
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
      case 'bg': return '#E3F2FD'; case 'plant': return '#E8F5E9';
      case 'ornament': return '#FFF3E0'; case 'flower': return '#FCE4EC';
      case 'pot': return '#EFEBE9'; default: return '#E0E0E0';
    }
  };

  const getRemainingStock = (itemId: string) => {
    const maxAllowed = itemId === 'WP-NONE' ? 1 : (SPRITE_CONFIG[itemId]?.maxQuantity ?? 99);
    const placedCount = settings?.gardenPlacements?.filter(p => p.itemId === itemId).length || 0;
    
    // ▼ 最大数1のアイテムは、配置済みなら在庫0としてブロック
    if (maxAllowed === 1) return placedCount > 0 ? 0 : 1;
    
    const totalOwned = settings?.itemCounts?.[itemId] || (ownedItems.includes(itemId) ? 1 : 0);
    return Math.max(0, totalOwned - placedCount);
  };

  const handleSelect = (itemId: string) => {
    if (getRemainingStock(itemId) <= 0) {
      Alert.alert('配置上限', '既に配置済み、または在庫がありません。');
      return;
    }
    onSelectItem(itemId);
  };

  return (
    <View style={styles.inventory}>
      <View style={styles.headerRow}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択</Text>
        <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filteredItems.map((itemId) => {
          if (itemId === 'WP-NONE') {
            return (
              <TouchableOpacity key={itemId} onPress={() => handleSelect(itemId)}
                style={[styles.inventoryItem, selectedItemId === itemId && styles.activeItem, { backgroundColor: getItemBackgroundColor(itemId) }]}>
                <Text style={{ fontSize: 10, color: '#666', fontWeight: 'bold' }}>None</Text>
              </TouchableOpacity>
            );
          }
          const isRestricted = (SPRITE_CONFIG[itemId]?.maxQuantity ?? 99) === 1;
          const isPlant = itemId.startsWith('PL-');
          const safeLevel = Math.max(1, settings?.itemLevels?.[itemId] || (itemId === 'PL-01' ? settings?.plantLevel : 1) || 1);
          const stock = getRemainingStock(itemId);
          const isOutOfStock = stock <= 0;

          return (
            <TouchableOpacity key={itemId} disabled={isOutOfStock} onPress={() => handleSelect(itemId)}
              style={[styles.inventoryItem, selectedItemId === itemId && styles.activeItem, isOutOfStock && styles.outOfStockItem, { backgroundColor: getItemBackgroundColor(itemId) }]}>
              <View style={isOutOfStock ? { opacity: 0.4 } : {}}>
                <UniversalSprite itemId={itemId} frameIndex={isPlant ? Math.max(0, Math.min(Math.floor(safeLevel) - 1, 4)) : 0} displaySize={32} />
              </View>
              {isPlant && <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>Lv.{safeLevel}</Text></View>}
              {!isRestricted && <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeZero]}><Text style={styles.stockBadgeText}>x{stock}</Text></View>}
            </TouchableOpacity>
          );
        })}
        {filteredItems.length === 0 && <Text style={styles.emptyText}>アイテムがありません</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inventoryTitle: { fontSize: 12, color: '#666' },
  inventoryItem: { padding: 8, borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center', minWidth: 56, minHeight: 56, position: 'relative' },
  activeItem: { borderColor: '#4CAF50' },
  outOfStockItem: { borderColor: '#E0E0E0', backgroundColor: '#F5F5F5' },
  emptyText: { color: '#999', paddingVertical: 8 },
  levelBadge: { position: 'absolute', top: -4, left: -4, backgroundColor: '#FF9800', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFF' },
  levelBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  stockBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#1976D2', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFF' },
  stockBadgeZero: { backgroundColor: '#9E9E9E' },
  stockBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
});