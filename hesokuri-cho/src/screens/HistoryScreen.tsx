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
  // ▼ 画像描画の完了を待機するためのステート
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { settings } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, isLoaded,
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  // ▼ キャンバスから全画像のロード完了通知を受け取る
  const handleCanvasLoadComplete = useCallback(() => {
    setIsCanvasLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <GardenHeader onOpenShop={() => setShopVisible(true)} />
      <TreeGrowthPanel />

      <View style={styles.canvasWrapper}>
        {/* データ自体の読み込み待ち */}
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
              onLoadComplete={handleCanvasLoadComplete} // ▼ 画像ロード検知をフック
            />
            
            {/* ▼ 画像の描画完了を待つオーバーレイ（データはロード済みだが画像が未展開の場合） */}
            {isCanvasLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>画像を準備しています...</Text>
              </View>
            )}

            {/* ▼ コントローラーは画像のロードが終わってから表示する */}
            {selectedTargetItem && !isCanvasLoading && (
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
  canvasWrapper: { flex: 1, position: 'relative', backgroundColor: '#E8F5E9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontWeight: 'bold' },
  // ▼ 画像ロード中のオーバーレイスタイル
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E8F5E9', // canvasWrapper の背景色に合わせる
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // キャンバスの上に確実に表示する
  }
});