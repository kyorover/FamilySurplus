// src/components/garden/IsometricGardenCanvas.tsx
import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, ActivityIndicator, Text, Image } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { CanvasItemNode } from './CanvasItemNode';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getGridCoordsFromScreen, GARDEN_CONFIG } from '../../functions/gardenUtils';
import { SPRITE_CONFIG, IMAGE_SOURCES } from '../../config/spriteConfig';
import { useHesokuriStore } from '../../store';
import { GardenZoomUI } from './GardenZoomUI';
import { useGardenEngine } from '../../hooks/useGardenEngine';

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

export const IsometricGardenCanvas: React.FC<Props> = ({ 
  placements = [], onPressTile, selectedItemIndex, viewOffset = { x: 0, y: 0 }, 
  zoomScale = 1.0, onZoomIn, onZoomOut, onPanMove, onPanRelease, onLoadComplete
}) => {
  const { settings } = useHesokuriStore();
  const [isLoading, setIsLoading] = useState(true); 

  // ▼ ロジックはカスタムフックに全委譲
  const { activeEffects, clearActiveEffect, panResponder, renderNodes } = useGardenEngine(
    placements, selectedItemIndex, onPanMove, onPanRelease
  );

  const bgItemId = placements.find(p => p.itemId.startsWith('BG-'))?.itemId || 'BG-01';
  const wpItemId = placements.find(p => p.itemId.startsWith('WP-'))?.itemId || null;
  const wpImageSource = wpItemId ? IMAGE_SOURCES[SPRITE_CONFIG[wpItemId].sourceId] : null;

  const totalImages = renderNodes.length;
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
    const fallbackTimer = setTimeout(() => { setIsLoading(false); if (onLoadComplete) onLoadComplete(); }, 1500); 
    return () => clearTimeout(fallbackTimer);
  }, [`${bgItemId}-${wpItemId || 'NONE'}`, onLoadComplete]);

  const handleBackgroundPress = (e: any) => {
    if (!onPressTile) return;
    const cx = SCREEN_WIDTH / 2; const cy = CANVAS_HEIGHT / 2;
    const logicalX = cx + (e.nativeEvent.locationX - cx) / zoomScale;
    const logicalY = cy + (e.nativeEvent.locationY - cy) / zoomScale;
    const grid = getGridCoordsFromScreen(logicalX - viewOffset.x, logicalY - viewOffset.y, SCREEN_WIDTH);
    if (grid.x >= 0 && grid.x < GARDEN_CONFIG.GRID_SIZE && grid.y >= 0 && grid.y < GARDEN_CONFIG.GRID_SIZE) onPressTile(grid.x, grid.y);
  };

  return (
    <View style={[styles.canvasContainer, !wpImageSource && { backgroundColor: '#E0F7FA' }]} {...panResponder.panHandlers}>
      <Pressable style={StyleSheet.absoluteFill} onPressIn={handleBackgroundPress} />
      
      <View style={{ flex: 1, transform: [{ scale: zoomScale }] }} pointerEvents="box-none">
        {wpImageSource && (
          <Image source={wpImageSource} style={{ position: 'absolute', width: SCREEN_WIDTH + WALLPAPER_OVERSIZE * 2, height: CANVAS_HEIGHT + WALLPAPER_OVERSIZE * 2, left: -WALLPAPER_OVERSIZE + viewOffset.x, top: -WALLPAPER_OVERSIZE + viewOffset.y }} resizeMode="repeat" pointerEvents="none" />
        )}
        
        {renderNodes.map((node) => {
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
            const itemLevel = settings?.itemLevels?.[node.placementData!.itemId] || (node.placementData!.itemId === 'PL-01' ? settings?.plantLevel : 1) || 1;
            return (
              <CanvasItemNode 
                key={node.id} node={node} finalLeft={finalLeft} finalTop={finalTop}
                isSelected={selectedItemIndex === node.originalIndex} itemLevel={itemLevel}
                activeEffectId={activeEffects[node.placementData!.itemId]}
                onPress={() => onPressTile?.(node.x, node.y)} onLoad={handleImageLoad} clearActiveEffect={clearActiveEffect}
              />
            );
          }
        })}
      </View>

      {onZoomIn && onZoomOut && <GardenZoomUI zoomScale={zoomScale} onZoomIn={onZoomIn} onZoomOut={onZoomOut} />}

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
  loadingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(224, 247, 250, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#00695C', fontWeight: 'bold' }
});