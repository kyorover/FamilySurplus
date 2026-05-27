// src/screens/GardenScreen.tsx
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
import { useTheme } from '../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../constants/colors'; // ▼ 新規追加: カラー型のインポート

export const GardenScreen: React.FC = () => {
  const { colors, isDark } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors, isDark); // ▼ 新規追加: 動的スタイル生成

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

// ▼ 変更: colorsとisDarkを引数に取るスタイル生成関数
const createStyles = (colors: Colors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, position: 'relative' },
  contentWrapper: { zIndex: 1 },
  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: isDark ? '#1B2A1E' : '#E8F5E9' }, // ▼ お庭の地面色は世界観維持のため固定色（ダークモード時は暗い緑）
  inventoryWrapper: { zIndex: 1 },
});