// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenPlacement } from '../../types';
import { useHesokuriStore } from '../../store';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';

export const GardenBuilderTest: React.FC = () => {
  const { settings } = useHesokuriStore();
  
  const [placements, setPlacements] = useState<GardenPlacement[]>([
    { itemId: 'PL-01', x: 2, y: 2 } 
  ]);
  
  const [isShopVisible, setShopVisible] = useState(false);
  
  // 現在操作中（十字キーが出ている）のアイテムのインデックス
  const [selectedPlacedItemIndex, setSelectedPlacedItemIndex] = useState<number | null>(null);

  // ▼ 所持アイテムのフィルタリングとソート（木 'PL-01' を必ず一番左にする）
  const ownedItems = (settings?.ownedGardenItemIds || [])
    .filter(itemId => SPRITE_CONFIG[itemId])
    .sort((a, b) => {
      if (a === 'PL-01') return -1;
      if (b === 'PL-01') return 1;
      return 0;
    });

  /**
   * 厳密な衝突判定関数（1x1 と 2x2 の重なりを正確に計算）
   * @returns true: 重なっている(エラー) / false: 重なっていない(安全)
   */
  const hasCollision = (currentPlacements: GardenPlacement[], targetIndex: number) => {
    const target = currentPlacements[targetIndex];
    const tSize = target.itemId === 'PL-01' ? 2 : 1;
    
    return currentPlacements.some((p, i) => {
      if (i === targetIndex) return false;
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      
      // 矩形(AABB)の交差判定
      const overlapX = target.x < p.x + pSize && target.x + tSize > p.x;
      const overlapY = target.y < p.y + pSize && target.y + tSize > p.y;
      
      return overlapX && overlapY;
    });
  };

  /**
   * 所持品リストのアイテムをタップした時の処理
   */
  const handleInventoryPress = (itemId: string) => {
    const existingIndex = placements.findIndex(p => p.itemId === itemId);
    
    if (existingIndex !== -1) {
      // 既に盤面にある場合は、それを選択状態にする
      setSelectedPlacedItemIndex(existingIndex);
    } else {
      // 盤面にない場合は、一番下（手前）のマスに出現させて選択状態にする
      const size = itemId === 'PL-01' ? 2 : 1;
      // 盤面の最大インデックスからサイズ分を引いた位置（右下/手前）に配置
      const spawnX = GARDEN_CONFIG.GRID_SIZE - size;
      const spawnY = GARDEN_CONFIG.GRID_SIZE - size;
      
      setPlacements(prev => {
        const newPlacements = [...prev, { itemId, x: spawnX, y: spawnY }];
        setSelectedPlacedItemIndex(newPlacements.length - 1);
        return newPlacements;
      });
    }
  };

  /**
   * 盤面のタイルを直接タップした時の処理
   */
  const handlePressTile = (x: number, y: number) => {
    const clickedItemIndex = placements.findIndex(p => {
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      return x >= p.x && x < p.x + pSize && y >= p.y && y < p.y + pSize;
    });

    if (clickedItemIndex !== -1) {
      // アイテムをタップしたら選択
      setSelectedPlacedItemIndex(clickedItemIndex);
    } else {
      // 空マスをタップした場合、現在選択中のアイテムがあれば選択解除を試みる
      if (selectedPlacedItemIndex !== null) {
        if (hasCollision(placements, selectedPlacedItemIndex)) {
          Alert.alert('配置エラー', '現在のアイテムが他のアイテムと重なっています。空いている場所に移動させるか、片付けてください。');
        } else {
          setSelectedPlacedItemIndex(null);
        }
      }
    }
  };

  /**
   * 十字キーでの移動処理
   * ※ ここでは他アイテムとの衝突判定は行わず、すり抜けを許可する（枠外判定のみ）
   */
  const handleMovePlacedItem = (dx: number, dy: number) => {
    if (selectedPlacedItemIndex === null) return;
    
    const target = placements[selectedPlacedItemIndex];
    const size = target.itemId === 'PL-01' ? 2 : 1;
    const newX = target.x + dx;
    const newY = target.y + dy;

    // 枠外にはみ出す移動のみブロック
    if (newX < 0 || newX + size > GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY + size > GARDEN_CONFIG.GRID_SIZE) {
      return;
    }

    setPlacements(prev => {
      const updated = [...prev];
      updated[selectedPlacedItemIndex] = { ...target, x: newX, y: newY };
      return updated;
    });
  };

  /**
   * 設置確定ボタンの処理（ここで初めて重なりエラーを出す）
   */
  const handleConfirmPlacement = () => {
    if (selectedPlacedItemIndex === null) return;
    
    // 確定時に重なっているアイテムがあればエラー
    if (hasCollision(placements, selectedPlacedItemIndex)) {
      Alert.alert('配置エラー', '他のアイテムと重なっているため、ここに配置することはできません。空いているマスへ移動させてください。');
      return;
    }
    
    setSelectedPlacedItemIndex(null); // 問題なければ選択解除（確定）
  };

  /**
   * 片付けるボタンの処理
   */
  const handleRemovePlacedItem = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => prev.filter((_, i) => i !== selectedPlacedItemIndex));
    setSelectedPlacedItemIndex(null);
  };

  const selectedTargetItem = selectedPlacedItemIndex !== null ? placements[selectedPlacedItemIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭づくりテスト</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
          <Text style={styles.shopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasWrapper}>
        <IsometricGardenCanvas 
          placements={placements} 
          onPressTile={handlePressTile} 
          selectedItemIndex={selectedPlacedItemIndex} 
        />

        {/* コントローラー */}
        {selectedTargetItem && (
          <View style={styles.isoControlsOverlay} pointerEvents="box-none">
            <View style={styles.isoDiamond}>
              <TouchableOpacity style={[styles.isoBtn, styles.btnTop]} onPress={() => handleMovePlacedItem(0, -1)}>
                <Text style={styles.isoArrow}>↗</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.isoBtn, styles.btnLeft]} onPress={() => handleMovePlacedItem(-1, 0)}>
                <Text style={styles.isoArrow}>↖</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.isoBtn, styles.btnRight]} onPress={() => handleMovePlacedItem(1, 0)}>
                <Text style={styles.isoArrow}>↘</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.isoBtn, styles.btnBottom]} onPress={() => handleMovePlacedItem(0, 1)}>
                <Text style={styles.isoArrow}>↙</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionRow}>
              {/* 木(PL-01)の場合は片付けるボタンを非表示にする */}
              {selectedTargetItem.itemId !== 'PL-01' && (
                <TouchableOpacity style={styles.removeBtn} onPress={handleRemovePlacedItem}>
                  <Text style={styles.actionBtnText}>片付ける</Text>
                </TouchableOpacity>
              )}
              {/* 設置を確定して選択状態を解除するボタン */}
              <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmPlacement}>
                <Text style={styles.actionBtnText}>設置確定</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.inventory}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択（所持品）</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ownedItems.map((itemId) => {
            // 現在のアイテムが盤面で選択中かどうか
            const isSelected = selectedTargetItem?.itemId === itemId;
            return (
              <TouchableOpacity
                key={itemId}
                style={[styles.inventoryItem, isSelected && styles.activeItem]}
                onPress={() => handleInventoryPress(itemId)}
              >
                <UniversalSprite itemId={itemId} frameIndex={0} displaySize={32} />
              </TouchableOpacity>
            );
          })}
          {ownedItems.length === 0 && (
            <Text style={styles.emptyText}>ショップでアイテムを購入してください</Text>
          )}
        </ScrollView>
      </View>

      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  shopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  shopBtnText: { color: '#FFF', fontWeight: 'bold' },
  
  canvasWrapper: { position: 'relative' }, 
  
  inventory: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  inventoryTitle: { fontSize: 12, color: '#666', marginBottom: 8 },
  inventoryItem: { padding: 8, backgroundColor: '#E0E0E0', borderRadius: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  activeItem: { borderColor: '#4CAF50' },
  emptyText: { color: '#999', paddingVertical: 8 },
  
  isoControlsOverlay: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    alignItems: 'center',
  },
  isoDiamond: {
    width: 120,
    height: 120,
    position: 'relative',
    marginBottom: 8,
  },
  isoBtn: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  btnTop: { top: 0, left: 38 },
  btnLeft: { top: 38, left: 0 },
  btnRight: { top: 38, left: 76 },
  btnBottom: { top: 76, left: 38 },
  isoArrow: { fontSize: 22, color: '#333', fontWeight: 'bold' },
  
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  removeBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    backgroundColor: 'rgba(255, 59, 48, 0.95)', 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  confirmBtn: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    backgroundColor: 'rgba(76, 175, 80, 0.95)', 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});