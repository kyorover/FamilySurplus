// src/components/garden/IsometricGardenCanvas.tsx
import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, PanResponder, ActivityIndicator, Text, Image } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { InteractiveGardenItem } from './InteractiveGardenItem';
import { EffectSprite } from './EffectSprite';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getGridCoordsFromScreen, getZIndexScore, GARDEN_CONFIG } from '../../functions/gardenUtils';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS, IMAGE_SOURCES } from '../../config/spriteConfig';
import { useHesokuriStore } from '../../store';
import { ALL_GARDEN_ITEMS } from '../../constants/gardenItems';
import { GardenZoomUI } from './GardenZoomUI';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 400; // キャンバスの高さ
const WALLPAPER_OVERSIZE = 4000; // 縮小時・スワイプ時にも余白を出さないための拡張余白

interface Props {
  placements?: GardenPlacement[];
  onPressTile?: (x: number, y: number) => void;
  selectedItemIndex?: number | null;
  viewOffset?: { x: number; y: number };
  zoomScale?: number; 
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onPanMove?: (dx: number, dy: number) => void;
  onPanRelease?: (dx: number, dy: number) => void;
  plantLevel?: number; // 後方互換のため残すが、描画時はStoreから個別レベルを優先参照する
  onLoadComplete?: () => void;
}

type RenderNode = { id: string; type: 'floor' | 'item' | 'large_item'; x: number; y: number; zIndex: number; placementData?: GardenPlacement; originalIndex?: number; };

export const IsometricGardenCanvas: React.FC<Props> = ({ 
  placements = [], onPressTile, selectedItemIndex, viewOffset = { x: 0, y: 0 }, 
  zoomScale = 1.0, onZoomIn, onZoomOut, onPanMove, onPanRelease, plantLevel = 1, onLoadComplete
}) => {
  const { settings } = useHesokuriStore();
  const [isLoading, setIsLoading] = useState(true); 
  
  // ▼ 修正: 個別の木ごとにエフェクト表示状態を管理する
  const [wateringEffects, setWateringEffects] = useState<Record<string, boolean>>({});
  const prevExpsRef = useRef<Record<string, number>>({});
  const prevLevelsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!settings) return;

    const currentExps: Record<string, number> = { ...(settings.itemExps || {}) };
    const currentLevels: Record<string, number> = { ...(settings.itemLevels || {}) };
    
    // 後方互換の取り込み
    if (settings.plantExp !== undefined) currentExps['PL-01'] = settings.plantExp;
    if (settings.plantLevel !== undefined) currentLevels['PL-01'] = settings.plantLevel;

    let hasChanges = false;
    const newEffects = { ...wateringEffects };

    placements.forEach(p => {
      if (!p.itemId.startsWith('PL-')) return;
      const itemId = p.itemId;
      const cExp = currentExps[itemId] || 0;
      // 初回マウント時はエフェクトを出さないよう、prevが無ければ現在の値を入れる
      const pExp = prevExpsRef.current[itemId] ?? cExp; 
      const cLevel = currentLevels[itemId] || 1;
      const pLevel = prevLevelsRef.current[itemId] ?? cLevel;

      // 経験値が増加した、またはレベルが上がった（経験値が0にリセットされた場合含む）場合にエフェクトを点火
      if (cExp > pExp || cLevel > pLevel) {
        newEffects[itemId] = true;
        hasChanges = true;
      }

      prevExpsRef.current[itemId] = cExp;
      prevLevelsRef.current[itemId] = cLevel;
    });

    if (hasChanges) {
      setWateringEffects(newEffects);
    }
  }, [settings?.itemExps, settings?.itemLevels, settings?.plantExp, settings?.plantLevel, placements]);

  const clearWateringEffect = useCallback((itemId: string) => {
    setWateringEffects(prev => ({ ...prev, [itemId]: false }));
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => selectedItemIndex === null && (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10),
      onPanResponderMove: (_, gs) => { if (selectedItemIndex === null && onPanMove) onPanMove(gs.dx, gs.dy); },
      onPanResponderRelease: (_, gs) => { if (selectedItemIndex === null && onPanRelease) onPanRelease(gs.dx, gs.dy); }
    })
  ).current;

  const bgPlacement = placements.find(p => p.itemId.startsWith('BG-'));
  const bgItemId = bgPlacement ? bgPlacement.itemId : 'BG-01';

  const wpPlacement = placements.find(p => p.itemId.startsWith('WP-'));
  const wpItemId = wpPlacement ? wpPlacement.itemId : null;
  const wpSprite = wpItemId ? SPRITE_CONFIG[wpItemId] : null;
  const wpImageSource = wpSprite ? IMAGE_SOURCES[wpSprite.sourceId] : null;

  const renderList = useMemo(() => {
    const nodes: RenderNode[] = [];
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) nodes.push({ id: `floor-${x}-${y}`, type: 'floor', x, y, zIndex: getZIndexScore(x, y, 'floor') });
    }
    placements.forEach((p, index) => {
      if (p.itemId.startsWith('BG-') || p.itemId.startsWith('WP-')) return; 
      const isLargeItem = p.itemId.startsWith('PL-');
      nodes.push({ id: `item-${p.itemId}-${index}`, type: isLargeItem ? 'large_item' : 'item', x: p.x, y: p.y, zIndex: getZIndexScore(p.x, p.y, isLargeItem ? 'large_item' : 'item'), placementData: p, originalIndex: index });
    });
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  const itemConfigString = `${bgItemId}-${wpItemId || 'NONE'}`;
  const totalImages = renderList.length;
  const loadedCountRef = useRef(0);

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= totalImages) {
      setIsLoading(false); 
      if (onLoadComplete) onLoadComplete();
    }
  }, [totalImages, onLoadComplete]);

  useEffect(() => {
    loadedCountRef.current = 0; 
    setIsLoading(true);
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadComplete) onLoadComplete();
    }, 1500); 
    return () => clearTimeout(fallbackTimer);
  }, [itemConfigString, onLoadComplete]);

  const handleBackgroundPress = (e: any) => {
    if (!onPressTile) return;
    const { locationX, locationY } = e.nativeEvent;
    const cx = SCREEN_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;
    const logicalX = cx + (locationX - cx) / zoomScale;
    const logicalY = cy + (locationY - cy) / zoomScale;

    const grid = getGridCoordsFromScreen(logicalX - viewOffset.x, logicalY - viewOffset.y, SCREEN_WIDTH);
    if (grid.x >= 0 && grid.x < GARDEN_CONFIG.GRID_SIZE && grid.y >= 0 && grid.y < GARDEN_CONFIG.GRID_SIZE) onPressTile(grid.x, grid.y);
  };

  const handleItemPress = (node: RenderNode) => {
    if (onPressTile) onPressTile(node.x, node.y);
  };

  return (
    <View style={[styles.canvasContainer, !wpImageSource && { backgroundColor: '#E0F7FA' }]} {...panResponder.panHandlers}>
      <Pressable style={StyleSheet.absoluteFill} onPressIn={handleBackgroundPress} />
      
      <View style={{ flex: 1, transform: [{ scale: zoomScale }] }} pointerEvents="box-none">
        
        {wpImageSource && (
          <Image
            source={wpImageSource}
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH + WALLPAPER_OVERSIZE * 2,
              height: CANVAS_HEIGHT + WALLPAPER_OVERSIZE * 2,
              left: -WALLPAPER_OVERSIZE + viewOffset.x,
              top: -WALLPAPER_OVERSIZE + viewOffset.y,
            }}
            resizeMode="repeat"
            pointerEvents="none" 
          />
        )}
        
        {renderList.map((node) => {
          const coords = getIsometricCoords(node.x, node.y, SCREEN_WIDTH);
          const finalLeft = coords.left + viewOffset.x; const finalTop = coords.top + viewOffset.y;
          
          if (node.type === 'floor') {
            const floorConfig = SPRITE_CONFIG[bgItemId];
            return (
              <View key={node.id} style={[styles.tileWrapper, { left: finalLeft + (floorConfig?.offsetX || 0), top: finalTop + (floorConfig?.offsetY || 0), width: GARDEN_CONFIG.TILE_WIDTH, height: GARDEN_CONFIG.TILE_WIDTH, zIndex: node.zIndex }]} pointerEvents="none">
                <UniversalSprite itemId={bgItemId} frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} onLoad={handleImageLoad} />
              </View>
            );
          } else {
            const isLarge = node.type === 'large_item';
            const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
            const baseScale = spriteDef?.baseScale ?? 1.0;
            const baseSize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
            const displaySize = baseSize * baseScale;
            const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
            const displayHeight = displaySize * aspectRatio;
            const tileCenterX = finalLeft + GARDEN_CONFIG.TILE_WIDTH / 2;
            const tileCenterY = finalTop + GARDEN_CONFIG.TILE_HEIGHT / 2;
            const leftPosition = tileCenterX - displaySize / 2 + (spriteDef?.offsetX || 0) * baseScale;
            const topPosition = tileCenterY - displayHeight + (spriteDef?.offsetY || 0) * baseScale;
            const isSelected = selectedItemIndex === node.originalIndex;
            const isFlipped = node.placementData?.isFlipped;
            const treeMaster = isLarge ? ALL_GARDEN_ITEMS.find(item => item.id === node.placementData!.itemId) : null;
            const effectId = treeMaster?.growthEffectId || 'EF-01';

            // ▼ 修正: マップ描画時も個別の木のレベルを取得してコマ番号を決定する
            const itemLevel = settings?.itemLevels?.[node.placementData!.itemId] || (node.placementData!.itemId === 'PL-01' ? settings?.plantLevel : 1) || 1;
            const safeFrameIndex = Math.max(0, Math.min(Math.floor(itemLevel) - 1, 4));

            return (
              <View key={node.id} style={{ position: 'absolute', left: leftPosition, top: topPosition, zIndex: node.zIndex }} pointerEvents="box-none">
                <View style={[styles.itemContent, isSelected && styles.selectedHighlight, isFlipped && { transform: [{ scaleX: -1 }] }]}>
                  {isLarge ? (
                    <Pressable onPress={() => handleItemPress(node)}>
                      {/* ▼ 修正: safeFrameIndex を渡す */}
                      <UniversalSprite itemId={node.placementData!.itemId} frameIndex={safeFrameIndex} displaySize={displaySize} onLoad={handleImageLoad} />
                    </Pressable>
                  ) : (
                    <InteractiveGardenItem itemId={node.placementData!.itemId} displaySize={displaySize} isAnimated={spriteDef?.isAnimated} onLoad={handleImageLoad} onPress={() => handleItemPress(node)} />
                  )}
                </View>
                {/* ▼ 修正: 対象のitemIdのエフェクト状態がtrueの場合のみ表示 */}
                {isLarge && wateringEffects[node.placementData!.itemId] && (
                  <View style={styles.effectOverlay}>
                    <EffectSprite 
                      effectId={effectId} 
                      displaySize={displaySize * 0.8} 
                      loop={false} 
                      durationPerFrame={150} 
                      onAnimationEnd={() => clearWateringEffect(node.placementData!.itemId)} 
                    />
                  </View>
                )}
              </View>
            );
          }
        })}
      </View>

      {onZoomIn && onZoomOut && (
        <GardenZoomUI zoomScale={zoomScale} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>ガーデンを準備中...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: { width: '100%', height: CANVAS_HEIGHT, position: 'relative', overflow: 'hidden' },
  tileWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  itemContent: { borderRadius: 16 },
  selectedHighlight: { backgroundColor: 'rgba(255, 215, 0, 0.4)', borderWidth: 2, borderColor: '#FFD700' },
  effectOverlay: { position: 'absolute', top: -40, left: 0, right: 0, alignItems: 'center', zIndex: 999, pointerEvents: 'none' }, 
  loadingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(224, 247, 250, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#00695C', fontWeight: 'bold' }
});