// src/components/garden/GardenBuilderTest.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenControllerOverlay } from './GardenControllerOverlay';
import { GardenInventoryTray } from './GardenInventoryTray';
import { GardenMapResetButton } from './GardenMapResetButton';
import { GardenPlacement } from '../../types';
import { useHesokuriStore } from '../../store';
import { SPRITE_CONFIG } from '../../config/spriteConfig';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';

export const GardenBuilderTest: React.FC = () => {
  const { settings, updateSettings } = useHesokuriStore();
  
  const [placements, setPlacements] = useState<GardenPlacement[]>([
    { itemId: 'PL-01', x: 2, y: 2 } 
  ]);
  const [isShopVisible, setShopVisible] = useState(false);
  const [selectedPlacedItemIndex, setSelectedPlacedItemIndex] = useState<number | null>(null);

  // ▼ マップの表示オフセット（初期値はストアから取得して記憶を復元）
  const [baseOffset, setBaseOffset] = useState<{x: number, y: number}>(settings?.gardenMapOffset || { x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  // 実際の描画オフセットは、ベース（確定分）＋ドラッグ中（一時分）の合算
  const currentViewOffset = {
    x: baseOffset.x + panOffset.x,
    y: baseOffset.y + panOffset.y,
  };

  const ownedItems = useMemo(() => {
    const rawItems = ['PL-01', ...(settings?.ownedGardenItemIds || [])];
    const uniqueItems = Array.from(new Set(rawItems));
    return uniqueItems
      .filter(itemId => SPRITE_CONFIG[itemId])
      .sort((a, b) => (a === 'PL-01' ? -1 : b === 'PL-01' ? 1 : 0));
  }, [settings?.ownedGardenItemIds]);

  const hasCollision = (currentPlacements: GardenPlacement[], targetIndex: number) => {
    const target = currentPlacements[targetIndex];
    const tSize = target.itemId === 'PL-01' ? 2 : 1;
    
    return currentPlacements.some((p, i) => {
      if (i === targetIndex) return false;
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      const overlapX = target.x < p.x + pSize && target.x + tSize > p.x;
      const overlapY = target.y < p.y + pSize && target.y + tSize > p.y;
      return overlapX && overlapY;
    });
  };

  const handleInventoryPress = (itemId: string) => {
    const existingIndex = placements.findIndex(p => p.itemId === itemId);
    if (existingIndex !== -1) {
      setSelectedPlacedItemIndex(existingIndex);
    } else {
      const size = itemId === 'PL-01' ? 2 : 1;
      const spawnX = GARDEN_CONFIG.GRID_SIZE - size;
      const spawnY = GARDEN_CONFIG.GRID_SIZE - size;
      setPlacements(prev => {
        const newPlacements = [...prev, { itemId, x: spawnX, y: spawnY }];
        setSelectedPlacedItemIndex(newPlacements.length - 1);
        return newPlacements;
      });
    }
  };

  const handlePressTile = (x: number, y: number) => {
    const clickedItemIndex = placements.findIndex(p => {
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      return x >= p.x && x < p.x + pSize && y >= p.y && y < p.y + pSize;
    });

    if (clickedItemIndex !== -1) {
      setSelectedPlacedItemIndex(clickedItemIndex);
    } else if (selectedPlacedItemIndex !== null) {
      if (hasCollision(placements, selectedPlacedItemIndex)) {
        Alert.alert('配置エラー', '現在のアイテムが他のアイテムと重なっています。');
      } else {
        setSelectedPlacedItemIndex(null);
      }
    }
  };

  const handleMovePlacedItem = (dx: number, dy: number) => {
    if (selectedPlacedItemIndex === null) return;
    const target = placements[selectedPlacedItemIndex];
    const size = target.itemId === 'PL-01' ? 2 : 1;
    const newX = target.x + dx;
    const newY = target.y + dy;

    if (newX < 0 || newX + size > GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY + size > GARDEN_CONFIG.GRID_SIZE) return;

    setPlacements(prev => {
      const updated = [...prev];
      updated[selectedPlacedItemIndex] = { ...target, x: newX, y: newY };
      return updated;
    });
  };

  const handleConfirmPlacement = () => {
    if (selectedPlacedItemIndex === null) return;
    if (hasCollision(placements, selectedPlacedItemIndex)) {
      Alert.alert('配置エラー', '他のアイテムと重なっているため、確定できません。');
      return;
    }
    setSelectedPlacedItemIndex(null);
  };

  const handleRemovePlacedItem = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => prev.filter((_, i) => i !== selectedPlacedItemIndex));
    setSelectedPlacedItemIndex(null);
  };

  // ▼ ドラッグ移動（パン）のハンドラ
  const handlePanMove = (dx: number, dy: number) => {
    setPanOffset({ x: dx, y: dy });
  };

  const handlePanRelease = (dx: number, dy: number) => {
    const newBaseOffset = { x: baseOffset.x + dx, y: baseOffset.y + dy };
    setBaseOffset(newBaseOffset);
    setPanOffset({ x: 0, y: 0 });
    // 設定に保存して記憶させる
    updateSettings({ ...settings, gardenMapOffset: newBaseOffset });
  };

  const handleResetMapPosition = () => {
    setBaseOffset({ x: 0, y: 0 });
    setPanOffset({ x: 0, y: 0 });
    updateSettings({ ...settings, gardenMapOffset: { x: 0, y: 0 } });
  };

  const selectedTargetItem = selectedPlacedItemIndex !== null ? placements[selectedPlacedItemIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭のレイアウト</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
          <Text style={styles.shopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasWrapper}>
        <GardenMapResetButton onReset={handleResetMapPosition} />
        
        <IsometricGardenCanvas 
          placements={placements} 
          onPressTile={handlePressTile} 
          selectedItemIndex={selectedPlacedItemIndex}
          viewOffset={currentViewOffset}
          onPanMove={handlePanMove}
          onPanRelease={handlePanRelease}
        />

        {selectedTargetItem && (
          <GardenControllerOverlay 
            onMove={handleMovePlacedItem}
            onRemove={handleRemovePlacedItem}
            onConfirm={handleConfirmPlacement}
            showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
          />
        )}
      </View>

      <GardenInventoryTray 
        ownedItems={ownedItems}
        selectedItemId={selectedTargetItem?.itemId || null}
        onSelectItem={handleInventoryPress}
      />

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
  canvasWrapper: { flex: 1, position: 'relative' }, 
});