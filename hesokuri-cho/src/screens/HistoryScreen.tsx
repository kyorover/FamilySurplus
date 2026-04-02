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

export const HistoryScreen: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { settings } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, isLoaded,
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  const handleCanvasLoadComplete = useCallback(() => {
    setIsCanvasLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <GardenHeader onOpenShop={() => setShopVisible(true)} />
      <TreeGrowthPanel />

      <View style={styles.canvasWrapper}>
        {!isLoaded ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>お庭のデータを読み込んでいます...</Text>
          </View>
        ) : (
          <>
            <GardenMapResetButton onReset={handleResetMapPosition} />
            <IsometricGardenCanvas 
              placements={placements} 
              onPressTile={handlePressTile} 
              selectedItemIndex={selectedPlacedItemIndex}
              viewOffset={currentViewOffset}
              onPanMove={handlePanMove}
              onPanRelease={handlePanRelease}
              plantLevel={plantLevel}
              onLoadComplete={handleCanvasLoadComplete}
            />
            
            {isCanvasLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>画像を準備しています...</Text>
              </View>
            )}

            {/* ▼ 壁紙が誤って選ばれた場合でもパネルを出さないガードを追加 */}
            {selectedTargetItem && !selectedTargetItem.itemId.startsWith('WP-') && !isCanvasLoading && (
              <GardenControllerOverlay 
                onMove={handleMovePlacedItem}
                onRemove={handleRemovePlacedItem}
                onConfirm={handleConfirmPlacement}
                onToggleMirror={handleToggleMirror}
                showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
              />
            )}
          </>
        )}
      </View>

      <GardenInventoryTray 
        ownedItems={ownedItems}
        selectedItemId={selectedTargetItem?.itemId || null}
        plantLevel={plantLevel} 
        onSelectItem={handleInventoryPress}
      />
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: '#E8F5E9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontWeight: 'bold' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F5E9', 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, 
  }
});