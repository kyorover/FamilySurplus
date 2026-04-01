// src/screens/HistoryScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
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
  const { setDebugPlantLevel, settings } = useHesokuriStore();
  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, isLoaded,
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleConfirmPlacement, handleRemovePlacedItem, handleToggleMirror
  } = useGardenPlacements();

  return (
    <View style={styles.container}>
      {__DEV__ && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugText}>[デバッグ] 木のレベル:</Text>
          {[1, 2, 3, 4, 5].map(lvl => (
            <TouchableOpacity key={lvl} onPress={() => setDebugPlantLevel(lvl)} style={styles.debugBtn}>
              <Text>{lvl}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <GardenHeader onOpenShop={() => setShopVisible(true)} />
      <TreeGrowthPanel />

      <View style={styles.canvasWrapper}>
        {!isLoaded ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>お庭を読み込んでいます...</Text>
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
              plantLevel={settings?.plantLevel || 1}
            />
            {selectedTargetItem && (
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

      <GardenInventoryTray ownedItems={ownedItems} selectedItemId={selectedTargetItem?.itemId || null} onSelectItem={handleInventoryPress} />
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  debugPanel: { flexDirection: 'row', padding: 8, backgroundColor: '#FFCDD2', alignItems: 'center', justifyContent: 'center' },
  debugText: { fontSize: 12, fontWeight: 'bold', marginRight: 8 },
  debugBtn: { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#FFF', borderRadius: 4, elevation: 2 },
  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: '#E8F5E9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontWeight: 'bold' }
});