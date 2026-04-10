// src/components/garden/GardenInventoryItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig'; 
import { GARDEN_CONFIG } from '../../functions/gardenUtils';
import { useHesokuriStore } from '../../store';

interface Props {
  itemId: string;
  ownedItems: string[];
  isSelected: boolean;
  onSelect: (itemId: string) => void;
}

export const GardenInventoryItem: React.FC<Props> = ({ itemId, ownedItems, isSelected, onSelect }) => {
  const { settings } = useHesokuriStore();

  const getItemBackgroundColor = (id: string) => {
    if (id === 'WP-NONE') return '#E0F7FA';
    const master = ALL_GARDEN_ITEMS.find(i => i.id === id);
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

  const isInfiniteItem = (id: string) => {
    return id.startsWith('PL-') || id.startsWith('BG-') || id.startsWith('WP-');
  };

  const getRemainingStock = (id: string) => {
    if (isInfiniteItem(id) || id === 'WP-NONE') return 1;
    const totalOwned = settings?.itemCounts?.[id] || (ownedItems.includes(id) ? 1 : 0);
    const placedCount = settings?.gardenPlacements?.filter(p => p.itemId === id).length || 0;
    return Math.max(0, totalOwned - placedCount);
  };

  const handlePress = () => {
    const stock = getRemainingStock(itemId);
    if (!isInfiniteItem(itemId) && itemId !== 'WP-NONE' && stock <= 0) return;
    onSelect(itemId);
  };

  if (itemId === 'WP-NONE') {
    return (
      <TouchableOpacity style={[styles.item, isSelected && styles.activeItem, { backgroundColor: getItemBackgroundColor(itemId) }]} onPress={handlePress}>
        <Text style={styles.noneText}>None</Text>
      </TouchableOpacity>
    );
  }

  const isPlant = itemId.startsWith('PL-');
  const itemLevel = settings?.itemLevels?.[itemId] || (itemId === 'PL-01' ? settings?.plantLevel : 1) || 1;
  const safeLevel = Math.max(1, itemLevel);
  const displayFrameIndex = isPlant ? Math.max(0, Math.min(Math.floor(safeLevel) - 1, 4)) : 0;
  
  const stock = getRemainingStock(itemId);
  const isInfinite = isInfiniteItem(itemId);
  const isOutOfStock = !isInfinite && stock <= 0;

  const spriteDef = SPRITE_CONFIG[itemId];
  const baseScale = spriteDef?.baseScale ?? 1.0;
  const baseSize = isPlant ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
  
  // ▼ 修正: 間延び防止のため、高さも考慮した厳密なサイズ計算（最大48pxの枠内に収める）
  const MAX_BOUNDING_BOX = 48;
  const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
  
  let displaySize = Math.min(baseSize * baseScale, MAX_BOUNDING_BOX);
  // 高さが上限を超える場合は、高さが収まるように幅を逆算して縮小する
  if (displaySize * aspectRatio > MAX_BOUNDING_BOX) {
    displaySize = MAX_BOUNDING_BOX / aspectRatio;
  }

  return (
    <TouchableOpacity
      disabled={isOutOfStock}
      style={[
        styles.item, 
        isSelected && styles.activeItem,
        isOutOfStock && styles.outOfStockItem,
        { backgroundColor: getItemBackgroundColor(itemId) }
      ]}
      onPress={handlePress}
    >
      <View style={isOutOfStock ? { opacity: 0.4 } : {}}>
        <UniversalSprite itemId={itemId} frameIndex={displayFrameIndex} displaySize={displaySize} />
      </View>
      
      {isPlant && (
        <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>Lv.{safeLevel}</Text></View>
      )}

      {!isInfinite && (
        <View style={[styles.stockBadge, isOutOfStock && styles.stockBadgeZero]}>
          <Text style={styles.stockBadgeText}>x{stock}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ▼ 修正: minWidth/minHeightを撤廃し、絶対値(64x64)でコンテナを固定してUIの拡張を防止
  item: { 
    borderRadius: 8, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: 'transparent', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 64, 
    height: 64, 
    position: 'relative' 
  },
  activeItem: { borderColor: '#4CAF50' },
  outOfStockItem: { borderColor: '#E0E0E0', backgroundColor: '#F5F5F5', opacity: 0.6 },
  noneText: { fontSize: 10, color: '#666', fontWeight: 'bold' },
  levelBadge: { position: 'absolute', top: -4, left: -4, backgroundColor: '#FF9800', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFF' },
  levelBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
  stockBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#1976D2', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#FFF' },
  stockBadgeZero: { backgroundColor: '#9E9E9E' },
  stockBadgeText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' }
});