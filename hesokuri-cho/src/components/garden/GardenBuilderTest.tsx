// src/components/garden/GardenBuilderTest.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
  // ▼ ローディング状態の管理
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { settings, setDebugPlantLevel } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, 
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  // ▼ キャンバスから全画像のロード完了通知を受け取る
  const handleCanvasLoadComplete = useCallback(() => {
    setIsCanvasLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭のレイアウト (デバッグ)</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
          <Text style={styles.shopBtnText}>ショップ</Text>
        </TouchableOpacity>
      </View>

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
          onLoadComplete={handleCanvasLoadComplete} // ▼追加
        />

        {/* ▼ ローディングオーバーレイ */}
        {isCanvasLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>画像を読み込み中...</Text>
          </View>
        )}

        {selectedTargetItem && !isCanvasLoading && (
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
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  shopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  shopBtnText: { color: '#FFF', fontWeight: 'bold' },
  debugPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: '#FFCDD2' },
  debugLabel: { fontSize: 12, fontWeight: 'bold', marginRight: 8, color: '#D32F2F' },
  debugBtn: { marginHorizontal: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, elevation: 1 },
  canvasWrapper: { flex: 1, position: 'relative' }, 
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // キャンバスの上に確実に表示する
  },
  loadingText: {
    marginTop: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  }
});