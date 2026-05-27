// src/components/garden/GardenShopListItem.tsx
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GardenItemMaster } from '../../constants/gardenItems';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface GardenShopListItemProps {
  item: GardenItemMaster;
  currentCount: number;
  onPurchase: (itemId: string, cost: number, name: string) => void;
}

export const GardenShopListItem: React.FC<GardenShopListItemProps> = ({ item, currentCount, onPurchase }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const maxAllowed = SPRITE_CONFIG[item.id]?.maxQuantity ?? 99;
  const isMax = currentCount >= maxAllowed;

  // ▼ マップ上の表示サイズと完全に一致させるための計算（ただし上限を設ける）
  const spriteDef = SPRITE_CONFIG[item.id];
  const baseScale = spriteDef?.baseScale ?? 1.0;
  const isTree = item.id.startsWith('PL-');
  const baseSize = isTree ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
  const mapDisplaySize = baseSize * baseScale;
  const MAX_ICON_SIZE = 60; // UIが間延びしないための最大サイズ制限
  const displaySize = Math.min(mapDisplaySize, MAX_ICON_SIZE);

  return (
    <View style={styles.itemRow}>
      <View style={styles.itemIconWrap}>
        <UniversalSprite itemId={item.id} frameIndex={0} displaySize={displaySize} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.metaInfo}>
          <Text style={styles.itemCost}>{item.cost} pt</Text>
          <Text style={styles.itemCountBadge}>所持: {currentCount}個</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.buyBtn, isMax && styles.buyBtnDisabled]} 
        onPress={() => onPurchase(item.id, item.cost, item.name)}
        disabled={isMax}
      >
        <Text style={styles.buyBtnText}>
          {isMax ? (maxAllowed === 1 ? '所持済' : '上限') : '交換'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemIconWrap: { width: 60, alignItems: 'center' }, // ▼ アイコンの最大幅に合わせてコンテナも調整
  itemInfo: { flex: 1, paddingHorizontal: 12 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary }, // ▼ 変更
  metaInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  itemCost: { fontSize: 14, color: colors.textSecondary, marginRight: 12 }, // ▼ 変更
  itemCountBadge: { fontSize: 12, color: isDark ? '#42A5F5' : '#1976D2', fontWeight: 'bold' }, // ▼ 変更: ダークモードで視認性を調整
  buyBtn: { backgroundColor: isDark ? '#FFB74D' : '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }, // ▼ 変更: ダークモードで視認性を調整
  buyBtnDisabled: { backgroundColor: isDark ? '#555555' : '#CCC' }, // ▼ 変更: ダークモード対応
  buyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }, // ※色付き背景上の文字は白固定
});