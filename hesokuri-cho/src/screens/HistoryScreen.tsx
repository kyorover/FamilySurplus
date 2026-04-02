// src/screens/HistoryScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { IsometricGardenCanvas } from '../components/garden/IsometricGardenCanvas';
import { GardenShopModal } from '../components/garden/GardenShopModal';
import { GardenControllerOverlay } from '../components/garden/GardenControllerOverlay';
import { GardenInventoryTray } from '../components/garden/GardenInventoryTray';
import { GardenMapResetButton } from '../components/garden/GardenMapResetButton';
import { TreeGrowthPanel } from '../components/garden/TreeGrowthPanel';
import { useGardenCamera } from '../hooks/useGardenCamera';
import { useGardenPlacements } from '../hooks/useGardenPlacements';
import { useHesokuriStore } from '../store';

export const HistoryScreen: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const { settings } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, isLoaded,
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  return (
    <View style={styles.container}>
      {/* お庭画面専用ヘッダー (庭名称表示を削除し、右上にショップを配置) */}
      <View style={styles.screenHeader}>
        <View style={styles.headerSpacer} />
        <Text style={styles.screenTitle}>お庭</Text>
        <TouchableOpacity onPress={() => setShopVisible(true)} style={styles.headerShopBtn}>
          <Text style={styles.headerShopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <TreeGrowthPanel />

      <View style={styles.canvasWrapper}>
        {!isLoaded ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>お庭を準備中...</Text>
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
  // 専用ヘッダースタイル
  screenHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA', zIndex: 10 },
  headerSpacer: { width: 70 }, // タイトルを中央に配置するためのダミー
  screenTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', textAlign: 'center', flex: 1 },
  headerShopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, minWidth: 70, alignItems: 'center' },
  headerShopBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: '#E8F5E9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontWeight: 'bold' },
});