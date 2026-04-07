// src/components/garden/GardenShopModal.tsx
import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useHesokuriStore } from '../../store';
import { GARDEN_ITEMS } from '../../constants/gardenItems';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig'; // 追加: 設定ファイルのインポート
import { GARDEN_CONFIG } from '../../functions/gardenUtils';

interface GardenShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export const GardenShopModal: React.FC<GardenShopModalProps> = ({ visible, onClose }) => {
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
            Alert.alert('完了', `${name} を獲得しました！`);
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
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemIconWrap}>
                    <UniversalSprite itemId={item.id} frameIndex={0} displaySize={displaySize} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <View style={styles.metaInfo}>
                      <Text style={styles.itemCost}>{item.cost} pt</Text>
                      <Text style={styles.itemCountBadge}>
                        所持: {currentCount}個
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={[styles.buyBtn, isMax && styles.buyBtnDisabled]} 
                    onPress={() => handlePurchase(item.id, item.cost, item.name)}
                    disabled={isMax}
                  >
                    <Text style={styles.buyBtnText}>
                      {isMax ? (maxAllowed === 1 ? '所持済' : '上限') : '交換'}
                    </Text>
                  </TouchableOpacity>
                </View>
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

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20 
  },
  modalContainer: { 
    backgroundColor: '#FFF', 
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
    marginVertical: 16 
  },
  pointContainer: { 
    alignItems: 'center', 
    marginBottom: 16 
  },
  pointLabel: { 
    fontSize: 12, 
    color: '#666' 
  },
  pointValue: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#4CAF50' 
  },
  listContent: { 
    paddingHorizontal: 16 
  },
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE' 
  },
  itemIconWrap: { 
    width: 60, // ▼ アイコンの最大幅に合わせてコンテナも調整
    alignItems: 'center' 
  },
  itemInfo: { 
    flex: 1, 
    paddingHorizontal: 12 
  },
  itemName: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemCost: { 
    fontSize: 14, 
    color: '#666',
    marginRight: 12
  },
  itemCountBadge: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  buyBtn: { 
    backgroundColor: '#FF9800', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20 
  },
  buyBtnDisabled: { 
    backgroundColor: '#CCC' 
  },
  buyBtnText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 12 
  },
  closeBtn: { 
    margin: 16, 
    backgroundColor: '#9E9E9E', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  closeBtnText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  }
});