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
  const [selectedItemIdToPlace, setSelectedItemIdToPlace] = useState<string | null>(null);
  
  const [selectedPlacedItemIndex, setSelectedPlacedItemIndex] = useState<number | null>(null);

  const ownedItems = (settings?.ownedGardenItemIds || []).filter(itemId => SPRITE_CONFIG[itemId]);

  const handlePressTile = (x: number, y: number) => {
    // 1. タップしたマスにアイテムがあるかチェック
    const clickedItemIndex = placements.findIndex(p => {
      if (p.itemId === 'PL-01') {
        return x >= p.x && x <= p.x + 1 && y >= p.y && y <= p.y + 1;
      }
      return p.x === x && p.y === y;
    });

    if (clickedItemIndex !== -1) {
      setSelectedPlacedItemIndex(clickedItemIndex);
      setSelectedItemIdToPlace(null);
      return;
    }

    // 2. 空マスをタップした場合（配置）
    if (selectedItemIdToPlace) {
      setPlacements(prev => {
        const newPlacements = [...prev, { itemId: selectedItemIdToPlace, x, y }];
        // 配置したアイテムを即座に選択状態にして操作ボタンを出す
        setSelectedPlacedItemIndex(newPlacements.length - 1);
        return newPlacements;
      });
      setSelectedItemIdToPlace(null);
    } else {
      // 何も持たずに空マスをタップしたら選択解除
      setSelectedPlacedItemIndex(null);
    }
  };

  const handleMovePlacedItem = (dx: number, dy: number) => {
    if (selectedPlacedItemIndex === null) return;
    
    const target = placements[selectedPlacedItemIndex];
    // クォータービューのマス目単位での移動
    const newX = target.x + dx;
    const newY = target.y + dy;

    if (newX < 0 || newX >= GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY >= GARDEN_CONFIG.GRID_SIZE) return;

    const isOccupied = placements.some((p, i) => i !== selectedPlacedItemIndex && p.x === newX && p.y === newY);
    if (isOccupied) return;

    setPlacements(prev => {
      const updated = [...prev];
      updated[selectedPlacedItemIndex] = { ...target, x: newX, y: newY };
      return updated;
    });
  };

  const handleRemovePlacedItem = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => prev.filter((_, i) => i !== selectedPlacedItemIndex));
    setSelectedPlacedItemIndex(null);
  };

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

        {/* アイテム操作用の斜め配置（ひし形）ボタン 
          背景の白枠を無くし、キャンバスを隠さないようにしています 
        */}
        {selectedPlacedItemIndex !== null && (
          <View style={styles.isoControlsOverlay} pointerEvents="box-none">
            <View style={styles.isoDiamond}>
              {/* ↗ 奥・右（Y軸を-1） */}
              <TouchableOpacity style={[styles.isoBtn, styles.btnTop]} onPress={() => handleMovePlacedItem(0, -1)}>
                <Text style={styles.isoArrow}>↗</Text>
              </TouchableOpacity>
              
              {/* ↖ 奥・左（X軸を-1） */}
              <TouchableOpacity style={[styles.isoBtn, styles.btnLeft]} onPress={() => handleMovePlacedItem(-1, 0)}>
                <Text style={styles.isoArrow}>↖</Text>
              </TouchableOpacity>
              
              {/* ↘ 手前・右（X軸を+1） */}
              <TouchableOpacity style={[styles.isoBtn, styles.btnRight]} onPress={() => handleMovePlacedItem(1, 0)}>
                <Text style={styles.isoArrow}>↘</Text>
              </TouchableOpacity>
              
              {/* ↙ 手前・左（Y軸を+1） */}
              <TouchableOpacity style={[styles.isoBtn, styles.btnBottom]} onPress={() => handleMovePlacedItem(0, 1)}>
                <Text style={styles.isoArrow}>↙</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemovePlacedItem}>
              <Text style={styles.removeBtnText}>片付ける</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inventory}>
        <Text style={styles.inventoryTitle}>配置アイテムを選択（所持品）</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ownedItems.map((itemId) => (
            <TouchableOpacity
              key={itemId}
              style={[styles.inventoryItem, itemId === selectedItemIdToPlace && styles.activeItem]}
              onPress={() => {
                setSelectedItemIdToPlace(itemId);
                setSelectedPlacedItemIndex(null); // 在庫を選んだら庭の選択は解除
              }}
            >
              <UniversalSprite itemId={itemId} frameIndex={0} displaySize={32} />
            </TouchableOpacity>
          ))}
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
  
  // ひし形（アイソメトリック）コントローラーのスタイル
  isoControlsOverlay: { 
    position: 'absolute', 
    bottom: 12, 
    right: 12, 
    alignItems: 'center',
    // 背景色とパディングを削除し、マップを隠さないように変更
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  // クォータービューのマス目に合わせて45度傾けた配置
  btnTop: { top: 0, left: 38 },
  btnLeft: { top: 38, left: 0 },
  btnRight: { top: 38, left: 76 },
  btnBottom: { top: 76, left: 38 },
  isoArrow: { fontSize: 22, color: '#333', fontWeight: 'bold' },
  
  removeBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    backgroundColor: 'rgba(255, 59, 48, 0.9)', 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  removeBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});