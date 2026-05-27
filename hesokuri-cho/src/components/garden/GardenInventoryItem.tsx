// src/components/garden/GardenInventoryItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig'; 
import { GARDEN_CONFIG } from '../../functions/gardenUtils';
import { useHesokuriStore } from '../../store';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface Props {
  itemId: string;
  ownedItems: string[];
  isSelected: boolean;
  onSelect: (itemId: string) => void;
}

export const GardenInventoryItem: React.FC<Props> = ({ itemId, ownedItems, isSelected, onSelect }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const { settings } = useHesokuriStore();

  const getItemBackgroundColor = (id: string) => {
    if (id === 'WP-NONE') return isDark ? 'rgba(0, 188, 212, 0.2)' : '#E0F7FA';
    const master = ALL_GARDEN_ITEMS.find(i => i.id === id);
    if (!master) return isDark ? 'rgba(158, 158, 158, 0.2)' : '#E0E0E0';
    switch (master.type) {
      case 'bg': return isDark ? 'rgba(33, 150, 243, 0.2)' : '#E3F2FD';
      case 'plant': return isDark ? 'rgba(76, 175, 80, 0.2)' : '#E8F5E9';
      case 'ornament': return isDark ? 'rgba(255, 152, 0, 0.2)' : '#FFF3E0';
      case 'flower': return isDark ? 'rgba(233, 30, 99, 0.2)' : '#FCE4EC';
      case 'pot': return isDark ? 'rgba(121, 85, 72, 0.2)' : '#EFEBE9';
      default: return isDark ? 'rgba(158, 158, 158, 0.2)' : '#E0E0E0';
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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
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
  activeItem: { borderColor: isDark ? '#66BB6A' : '#4CAF50' }, // ▼ 変更: ダークモードで明るい緑に
  outOfStockItem: { borderColor: colors.border, backgroundColor: colors.background, opacity: 0.6 },
  noneText: { fontSize: 10, color: colors.textSecondary, fontWeight: 'bold' },
  levelBadge: { position: 'absolute', top: -4, left: -4, backgroundColor: isDark ? '#FFB74D' : '#FF9800', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#000' : '#FFF' },
  levelBadgeText: { color: isDark ? '#000' : '#FFF', fontSize: 8, fontWeight: 'bold' },
  stockBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: isDark ? '#42A5F5' : '#1976D2', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#000' : '#FFF' },
  stockBadgeZero: { backgroundColor: '#9E9E9E' },
  stockBadgeText: { color: isDark ? '#000' : '#FFF', fontSize: 8, fontWeight: 'bold' }
});