// src/screens/HistoryScreen.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { IsometricGardenCanvas } from '../components/garden/IsometricGardenCanvas';
import { GardenShopModal } from '../components/garden/GardenShopModal';
import { GardenControllerOverlay } from '../components/garden/GardenControllerOverlay';
import { GardenInventoryTray } from '../components/garden/GardenInventoryTray';
import { GardenMapResetButton } from '../components/garden/GardenMapResetButton';
import { GardenHeader } from '../components/garden/GardenHeader';
import { TreeGrowthPanel } from '../components/garden/TreeGrowthPanel';
import { useGardenCamera } from '../hooks/useGardenCamera';
import { useGardenPlacements } from '../hooks/useGardenPlacements';
import { useHesokuriStore } from '../store';
import { GardenPlacementBlocker } from '../components/garden/GardenPlacementBlocker';

export const HistoryScreen: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { settings } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { currentViewOffset, zoomScale, handlePanMove, handlePanRelease, handleResetMapPosition, handleZoomIn, handleZoomOut } = useGardenCamera();
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, isLoaded,
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  const handleCanvasLoadComplete = useCallback(() => setIsCanvasLoading(false), []);
  const isPlacementMode = selectedTargetItem && !selectedTargetItem.itemId.startsWith('WP-') && !isCanvasLoading;

  if (!isLoaded) return null;

  return (
    <View style={styles.container}>
      <GardenPlacementBlocker isActive={!!isPlacementMode} />

      <View style={[styles.contentWrapper, isPlacementMode && { opacity: 0.3 }]} pointerEvents={isPlacementMode ? 'none' : 'auto'}>
        <GardenHeader onOpenShop={() => setShopVisible(true)} />
        <TreeGrowthPanel />
      </View>
      
      <View style={[styles.canvasWrapper, isPlacementMode && { zIndex: 10 }]}>
        <GardenMapResetButton onReset={handleResetMapPosition} />
        <IsometricGardenCanvas 
          placements={placements} onPressTile={handlePressTile} selectedItemIndex={selectedPlacedItemIndex}
          viewOffset={currentViewOffset} zoomScale={zoomScale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
          onPanMove={handlePanMove} onPanRelease={handlePanRelease} plantLevel={plantLevel} onLoadComplete={handleCanvasLoadComplete}
        />

        {/* ▼ 修正: Canvas側と二重になっていたローディングUIを削除し、残像バグを解消 */}

        {isPlacementMode && (
          <GardenControllerOverlay 
            onMove={handleMovePlacedItem} onRemove={handleRemovePlacedItem} onConfirm={handleConfirmPlacement}
            onToggleMirror={handleToggleMirror} showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
          />
        )}
      </View>

      <View style={[styles.inventoryWrapper, isPlacementMode && { opacity: 0.3 }]} pointerEvents={isPlacementMode ? 'none' : 'auto'}>
        <GardenInventoryTray 
          ownedItems={ownedItems} selectedItemId={selectedTargetItem?.itemId || null}
          plantLevel={plantLevel} onSelectItem={handleInventoryPress}
        />
      </View>
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', position: 'relative' },
  contentWrapper: { zIndex: 1 },
  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: '#E8F5E9' },
  inventoryWrapper: { zIndex: 1 },
});