// src/components/garden/GardenBuilderTest.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenControllerOverlay } from './GardenControllerOverlay';
import { GardenInventoryTray } from './GardenInventoryTray';
import { GardenMapResetButton } from './GardenMapResetButton';
import { useGardenCamera } from '../../hooks/useGardenCamera';
import { useGardenPlacements } from '../../hooks/useGardenPlacements';
import { useHesokuriStore } from '../../store';

export const GardenBuilderTest: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { settings, setDebugPlantLevel } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, 
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  return (
    <View style={styles.container}>
      {/* 冗長なヘッダーとショップボタンは削除済 (親の設定画面側で制御するため) */}

      {/* デバッグ専用：知恵の木レベル変更 */}
      <View style={styles.debugPanel}>
        <Text style={styles.debugLabel}>木のレベル変更:</Text>
        {[1, 2, 3, 4, 5].map(lvl => (
          <TouchableOpacity key={lvl} onPress={() => setDebugPlantLevel(lvl)} style={styles.debugBtn}>
            <Text style={{ fontWeight: plantLevel === lvl ? 'bold' : 'normal', color: plantLevel === lvl ? '#FFF' : '#333' }}>
              LV.{lvl}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.canvasWrapper}>
        <GardenMapResetButton onReset={handleResetMapPosition} />
        <IsometricGardenCanvas 
          placements={placements} onPressTile={handlePressTile} selectedItemIndex={selectedPlacedItemIndex}
          viewOffset={currentViewOffset} onPanMove={handlePanMove} onPanRelease={handlePanRelease} plantLevel={plantLevel}
        />
        {selectedTargetItem && (
          <GardenControllerOverlay 
            onMove={handleMovePlacedItem} onRemove={handleRemovePlacedItem} onConfirm={handleConfirmPlacement}
            onToggleMirror={handleToggleMirror} showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
          />
        )}
      </View>
      <GardenInventoryTray ownedItems={ownedItems} selectedItemId={selectedTargetItem?.itemId || null} onSelectItem={handleInventoryPress} />
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  debugPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: '#FFCDD2' },
  debugLabel: { fontSize: 12, fontWeight: 'bold', marginRight: 8, color: '#D32F2F' },
  debugBtn: { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, elevation: 1 },
  canvasWrapper: { flex: 1, position: 'relative' }, 
});