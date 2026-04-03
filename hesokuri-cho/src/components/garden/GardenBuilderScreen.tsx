// src/components/garden/GardenBuilderScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { IsometricGardenCanvas } from './IsometricGardenCanvas';
import { GardenShopModal } from './GardenShopModal';
import { GardenControllerOverlay } from './GardenControllerOverlay';
import { GardenInventoryTray } from './GardenInventoryTray';
import { GardenMapResetButton } from './GardenMapResetButton';
import { useGardenCamera } from '../../hooks/useGardenCamera';
import { useGardenPlacements } from '../../hooks/useGardenPlacements';
import { useHesokuriStore } from '../../store';
import { GardenPlacementBlocker } from './GardenPlacementBlocker';

export const GardenBuilderScreen: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { currentViewOffset, zoomScale, handlePanMove, handlePanRelease, handleResetMapPosition, handleZoomIn, handleZoomOut } = useGardenCamera();
  const { settings, updateSettings, setDebugPlantLevel, updateGardenPlacements } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  const [debugPoints, setDebugPoints] = useState<string>(String(settings?.gardenPoints || 0));

  useEffect(() => setDebugPoints(String(settings?.gardenPoints || 0)), [settings?.gardenPoints]);

  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, 
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  const isPlacementMode = selectedTargetItem && !selectedTargetItem.itemId.startsWith('WP-') && !isCanvasLoading;
  const handleCanvasLoadComplete = useCallback(() => setIsCanvasLoading(false), []);

  const handleUpdatePoints = async () => {
    const p = parseInt(debugPoints, 10);
    if (!isNaN(p) && settings) await updateSettings({ ...settings, gardenPoints: p });
  };

  const handleResetPurchases = () => {
    Alert.alert(
      '購入状態リセット',
      'すべての購入済みアイテムと配置をリセットしますか？（知恵の木は残ります）',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            if (!settings) return;
            // 知恵の木 (WP- で始まるアイテム) のみを残す
            const defaultPlacements = settings.gardenPlacements?.filter(p => p.itemId.startsWith('WP-')) || [];
            await updateSettings({
              ...settings,
              ownedGardenItemIds: [],
              gardenPlacements: defaultPlacements
            });
          }
        }
      ]
    );
  };

  const canvasPlacements = useMemo(() => {
    const base = placements.filter(p => !p.itemId.startsWith('WP-'));
    const wp = settings?.gardenPlacements?.find(p => p.itemId.startsWith('WP-'));
    if (wp) base.push(wp);
    return base;
  }, [placements, settings?.gardenPlacements]);

  return (
    <View style={styles.container}>
      <GardenPlacementBlocker isActive={!!isPlacementMode} />

      <View style={[styles.header, isPlacementMode && { opacity: 0.3 }]} pointerEvents={isPlacementMode ? 'none' : 'auto'}>
        <Text style={styles.headerText}>お庭のレイアウト (デバッグ)</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
            <Text style={styles.btnText}>ショップ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.debugPanel, isPlacementMode && { opacity: 0.3 }]} pointerEvents={isPlacementMode ? 'none' : 'auto'}>
        <Text style={styles.debugLabel}>木のLV:</Text>
        {[1, 2, 3, 4, 5].map(lvl => (
          <TouchableOpacity key={lvl} onPress={() => setDebugPlantLevel(lvl)} style={styles.debugBtn}>
            <Text style={{ fontWeight: plantLevel === lvl ? 'bold' : 'normal', color: plantLevel === lvl ? '#FFF' : '#333' }}>LV.{lvl}</Text>
          </TouchableOpacity>
        ))}
        <TextInput style={styles.pointInput} keyboardType="numeric" value={debugPoints} onChangeText={setDebugPoints} />
        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePoints}>
          <Text style={styles.updateBtnText}>反映</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={handleResetPurchases}>
          <Text style={styles.resetBtnText}>購入リセット</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.canvasWrapper, isPlacementMode && { zIndex: 10 }]}>
        <GardenMapResetButton onReset={handleResetMapPosition} />
        <IsometricGardenCanvas 
          placements={canvasPlacements} onPressTile={handlePressTile} selectedItemIndex={selectedPlacedItemIndex}
          viewOffset={currentViewOffset} zoomScale={zoomScale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut}
          onPanMove={handlePanMove} onPanRelease={handlePanRelease} plantLevel={plantLevel} onLoadComplete={handleCanvasLoadComplete}
        />
        {isPlacementMode && (
          <GardenControllerOverlay 
            onMove={handleMovePlacedItem} onRemove={handleRemovePlacedItem} onConfirm={handleConfirmPlacement}
            onToggleMirror={handleToggleMirror} showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
          />
        )}
      </View>
      
      <View style={[styles.inventoryWrapper, isPlacementMode && { opacity: 0.3 }]} pointerEvents={isPlacementMode ? 'none' : 'auto'}>
        <GardenInventoryTray ownedItems={ownedItems} selectedItemId={selectedTargetItem?.itemId || null} plantLevel={plantLevel} onSelectItem={handleInventoryPress} />
      </View>
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', position: 'relative' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', zIndex: 1 },
  headerText: { fontSize: 14, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', gap: 8 },
  shopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  debugPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: '#FFCDD2', flexWrap: 'wrap', gap: 4, zIndex: 1 },
  debugLabel: { fontSize: 12, fontWeight: 'bold', color: '#D32F2F' },
  debugBtn: { marginHorizontal: 2, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, elevation: 1 },
  pointInput: { backgroundColor: '#FFF', width: 60, height: 28, borderRadius: 4, paddingHorizontal: 8, fontSize: 12, textAlign: 'right' },
  updateBtn: { backgroundColor: '#1976D2', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4 },
  updateBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  resetBtn: { backgroundColor: '#D32F2F', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4, marginLeft: 4 },
  resetBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  canvasWrapper: { flex: 1, position: 'relative' }, 
  inventoryWrapper: { zIndex: 1 },
});