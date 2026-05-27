// src/components/garden/GardenShopModal.tsx
import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_ITEMS, GardenItemMaster } from '../../constants/gardenItems';
import { SPRITE_CONFIG } from '../../config/spriteConfig'; // 追加: 設定ファイルのインポート
import { GardenShopListItem } from './GardenShopListItem';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface GardenShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GardenShopModal: React.FC<GardenShopModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

  const { settings, updateSettings } = useHesokuriStore();

  if (!settings) return null;

  const currentPoints = settings.gardenPoints ?? 0;
  const ownedItems = settings.ownedGardenItemIds ?? [];
  const itemCounts = settings.itemCounts ?? {};

  const handlePurchase = (itemId: string, cost: number, name: string) => {
    // 現在の所持数を算出
    const currentCount = itemCounts[itemId] || (ownedItems.includes(itemId) ? 1 : 0);
    // spriteConfigから上限を取得（設定がない場合はデフォルトで99個）
    const maxAllowed = SPRITE_CONFIG[itemId]?.maxQuantity ?? 99;

    if (currentCount >= maxAllowed) {
      Alert.alert(
        '上限到達', 
        maxAllowed === 1 ? 'このアイテムは既に持っています。' : `このアイテムはこれ以上持てません（最大${maxAllowed}個）。`
      );
      return;
    }

    if (currentPoints < cost) {
      Alert.alert('ポイント不足', 'ガーデンポイントが足りません。\n水やりをしてポイントを貯めましょう！');
      return;
    }
    
    Alert.alert(
      'アイテムの交換',
      `${name} を ${cost}pt で交換しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '交換', 
          onPress: () => {
            const newOwnedItems = ownedItems.includes(itemId) ? ownedItems : [...ownedItems, itemId];
            
            updateSettings({
              ...settings,
              gardenPoints: currentPoints - cost,
              ownedGardenItemIds: newOwnedItems,
              itemCounts: {
                ...itemCounts,
                [itemId]: currentCount + 1
              }
            });
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>ガーデンショップ</Text>
          <View style={styles.pointContainer}>
            <Text style={styles.pointLabel}>所持ポイント</Text>
            <Text style={styles.pointValue}>{currentPoints} pt</Text>
          </View>

          <ScrollView contentContainerStyle={styles.listContent}>
            {GARDEN_ITEMS.map((item) => {
              const currentCount = itemCounts[item.id] || (ownedItems.includes(item.id) ? 1 : 0);
              return (
                <GardenShopListItem
                  key={item.id}
                  item={item as GardenItemMaster}
                  currentCount={currentCount}
                  onPurchase={handlePurchase}
                />
              );
            })}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: colors.overlay, // ▼ 変更
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20 
  },
  modalContainer: { 
    backgroundColor: colors.surface, // ▼ 変更
    margin: 20, 
    borderRadius: 16, 
    flex: 1, 
    maxHeight: '80%', 
    overflow: 'hidden' 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginVertical: 16,
    color: colors.textPrimary // ▼ 新規追加
  },
  pointContainer: { 
    alignItems: 'center', 
    marginBottom: 16 
  },
  pointLabel: { 
    fontSize: 12, 
    color: colors.textSecondary // ▼ 変更
  },
  pointValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: isDark ? '#66BB6A' : '#4CAF50' // ▼ 変更: ダークモードで視認性を調整
  },
  listContent: { 
    paddingHorizontal: 16 
  },
  closeBtn: { 
    margin: 16, 
    backgroundColor: isDark ? '#555555' : '#9E9E9E', // ▼ 変更: ダークモード対応
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  closeBtnText: { 
    color: '#FFF', // ※グレー背景上の文字は白固定
    fontWeight: 'bold' 
  }
});