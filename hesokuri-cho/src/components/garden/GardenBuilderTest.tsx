// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenControllerOverlay } from './GardenControllerOverlay';
import { GardenInventoryTray } from './GardenInventoryTray';
import { GardenMapResetButton } from './GardenMapResetButton';

// ▼ 新設したカスタムフックからロジックを呼び出す
import { useGardenCamera } from '../../hooks/useGardenCamera';
import { useGardenPlacements } from '../../hooks/useGardenPlacements';

export const GardenBuilderTest: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  
  // マップカメラのロジック
  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  
  // アイテム配置と操作のロジック
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, 
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

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