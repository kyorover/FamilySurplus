// src/components/garden/GardenBuilderTest.tsx
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

export const GardenBuilderTest: React.FC = () => {
  const [isShopVisible, setShopVisible] = useState(false);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);

  const { currentViewOffset, handlePanMove, handlePanRelease, handleResetMapPosition } = useGardenCamera();
  const { settings, updateSettings, setDebugPlantLevel, updateGardenPlacements } = useHesokuriStore();
  const plantLevel = settings?.plantLevel || 1;

  // ▼ ポイント設定用のローカルステート
  const [debugPoints, setDebugPoints] = useState<string>(String(settings?.gardenPoints || 0));

  useEffect(() => {
    setDebugPoints(String(settings?.gardenPoints || 0));
  }, [settings?.gardenPoints]);

  const { 
    placements, selectedPlacedItemIndex, selectedTargetItem, ownedItems, 
    handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem 
  } = useGardenPlacements();

  const handleCanvasLoadComplete = useCallback(() => {
    setIsCanvasLoading(false);
  }, []);

  // ▼ ショップ購入状況＆配置状況のリセット
  const handleResetShopAndPlacements = () => {
    Alert.alert(
      'ショップ・配置リセット',
      '所持アイテムと配置状況をすべて初期化しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'リセットする', 
          style: 'destructive', 
          onPress: async () => {
            if (settings) {
              await updateSettings({
                ...settings,
                ownedGardenItemIds: [],
                gardenPlacements: [],
              });
            }
          }
        }
      ]
    );
  };

  // ▼ 所持ポイントの手動更新
  const handleUpdatePoints = async () => {
    const p = parseInt(debugPoints, 10);
    if (!isNaN(p) && settings) {
      await updateSettings({ ...settings, gardenPoints: p });
      Alert.alert('更新完了', `所持ポイントを ${p} に設定しました。`);
    }
  };

  // ▼ 壁紙用のカスタム配置ロジック（即時適用・排他制御）
  const handleCustomInventoryPress = (itemId: string) => {
    if (itemId.startsWith('WP-') || itemId === 'WP-NONE') {
      if (settings) {
        const newPlacements = (settings.gardenPlacements || []).filter(p => !p.itemId.startsWith('WP-'));
        if (itemId !== 'WP-NONE') {
          newPlacements.push({ itemId, x: 0, y: 0 }); // 壁紙の座標は無視されるため0を設定
        }
        updateGardenPlacements(newPlacements);
      }
      // ▼ 壁紙の場合はここで処理を終了し、配置モード（操作パネル）に入れない
      return; 
    }
    handleInventoryPress(itemId);
  };

  // ▼ ローカルの配置状況とStoreの壁紙情報をマージしてキャンバスの即時反映を実現
  const canvasPlacements = useMemo(() => {
    const base = placements.filter(p => !p.itemId.startsWith('WP-'));
    const wp = settings?.gardenPlacements?.find(p => p.itemId.startsWith('WP-'));
    if (wp) base.push(wp);
    return base;
  }, [placements, settings?.gardenPlacements]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>お庭のレイアウト (デバッグ)</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleResetShopAndPlacements}>
            <Text style={styles.btnText}>全リセット</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shopBtn} onPress={() => setShopVisible(true)}>
            <Text style={styles.btnText}>ショップ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.debugPanel}>
        <Text style={styles.debugLabel}>木のLV:</Text>
        {[1, 2, 3, 4, 5].map(lvl => (
          <TouchableOpacity key={lvl} onPress={() => setDebugPlantLevel(lvl)} style={styles.debugBtn}>
            <Text style={{ fontWeight: plantLevel === lvl ? 'bold' : 'normal', color: plantLevel === lvl ? '#FFF' : '#333' }}>
              LV.{lvl}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.debugLabel, { marginLeft: 16 }]}>所持pt:</Text>
        <TextInput 
          style={styles.pointInput}
          keyboardType="numeric"
          value={debugPoints}
          onChangeText={setDebugPoints}
        />
        <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePoints}>
          <Text style={styles.updateBtnText}>反映</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasWrapper}>
        <GardenMapResetButton onReset={handleResetMapPosition} />
        
        {/* ▼ placements の代わりにマージ済みの canvasPlacements を渡す */}
        <IsometricGardenCanvas 
          placements={canvasPlacements} onPressTile={handlePressTile} selectedItemIndex={selectedPlacedItemIndex}
          viewOffset={currentViewOffset} onPanMove={handlePanMove} onPanRelease={handlePanRelease} plantLevel={plantLevel}
          onLoadComplete={handleCanvasLoadComplete}
        />

        {isCanvasLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>画像を読み込み中...</Text>
          </View>
        )}

        {/* ▼ 壁紙が selectedTargetItem に入ってしまった場合でもパネルを出さないようにガード */}
        {selectedTargetItem && !selectedTargetItem.itemId.startsWith('WP-') && !isCanvasLoading && (
          <GardenControllerOverlay 
            onMove={handleMovePlacedItem} onRemove={handleRemovePlacedItem} onConfirm={handleConfirmPlacement}
            onToggleMirror={handleToggleMirror} showRemoveButton={selectedTargetItem.itemId !== 'PL-01'} 
          />
        )}
      </View>
      
      {/* ▼ onSelectItem に handleCustomInventoryPress を割り当てる */}
      <GardenInventoryTray 
        ownedItems={ownedItems} 
        selectedItemId={selectedTargetItem?.itemId || null} 
        plantLevel={plantLevel}
        onSelectItem={handleCustomInventoryPress} 
      />
      <GardenShopModal visible={isShopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  headerText: { fontSize: 14, fontWeight: 'bold' },
  headerRight: { flexDirection: 'row', gap: 8 },
  shopBtn: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  dangerBtn: { backgroundColor: '#E53935', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  debugPanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 8, backgroundColor: '#FFCDD2', flexWrap: 'wrap', gap: 4 },
  debugLabel: { fontSize: 12, fontWeight: 'bold', color: '#D32F2F' },
  debugBtn: { marginHorizontal: 2, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, elevation: 1 },
  pointInput: { backgroundColor: '#FFF', width: 60, height: 28, borderRadius: 4, paddingHorizontal: 8, fontSize: 12, textAlign: 'right' },
  updateBtn: { backgroundColor: '#1976D2', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4 },
  updateBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  canvasWrapper: { flex: 1, position: 'relative' }, 
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#E0F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  }
});