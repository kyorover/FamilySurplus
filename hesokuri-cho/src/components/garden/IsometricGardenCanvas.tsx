// src/components/garden/IsometricGardenCanvas.tsx
import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Pressable, PanResponder } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { InteractiveGardenItem } from './InteractiveGardenItem';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getGridCoordsFromScreen, getZIndexScore, GARDEN_CONFIG } from '../../functions/gardenUtils';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  placements?: GardenPlacement[];
  onPressTile?: (x: number, y: number) => void;
  selectedItemIndex?: number | null;
  viewOffset?: { x: number; y: number };
  onPanMove?: (dx: number, dy: number) => void;
  onPanRelease?: (dx: number, dy: number) => void;
  plantLevel?: number; // 知恵の木レベル(1-5)
}

type RenderNode = { id: string; type: 'floor' | 'item' | 'large_item'; x: number; y: number; zIndex: number; placementData?: GardenPlacement; originalIndex?: number; };

export const IsometricGardenCanvas: React.FC<Props> = ({ 
  placements = [], onPressTile, selectedItemIndex, viewOffset = { x: 0, y: 0 }, onPanMove, onPanRelease, plantLevel = 1 
}) => {
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => selectedItemIndex === null && (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10),
      onPanResponderMove: (_, gs) => { if (selectedItemIndex === null && onPanMove) onPanMove(gs.dx, gs.dy); },
      onPanResponderRelease: (_, gs) => { if (selectedItemIndex === null && onPanRelease) onPanRelease(gs.dx, gs.dy); }
    })
  ).current;

  const renderList = useMemo(() => {
    const nodes: RenderNode[] = [];
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) nodes.push({ id: `floor-${x}-${y}`, type: 'floor', x, y, zIndex: getZIndexScore(x, y, 'floor') });
    }
    placements.forEach((p, index) => {
      const isLargeItem = p.itemId === 'PL-01';
      nodes.push({ id: `item-${p.itemId}-${index}`, type: isLargeItem ? 'large_item' : 'item', x: p.x, y: p.y, zIndex: getZIndexScore(p.x, p.y, isLargeItem ? 'large_item' : 'item'), placementData: p, originalIndex: index });
    });
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  const handleBackgroundPress = (e: any) => {
    if (!onPressTile) return;
    const { locationX, locationY } = e.nativeEvent;
    const grid = getGridCoordsFromScreen(locationX - viewOffset.x, locationY - viewOffset.y, SCREEN_WIDTH);
    if (grid.x >= 0 && grid.x < GARDEN_CONFIG.GRID_SIZE && grid.y >= 0 && grid.y < GARDEN_CONFIG.GRID_SIZE) onPressTile(grid.x, grid.y);
  };

  return (
    <View style={styles.canvasContainer} {...panResponder.panHandlers}>
      <Pressable style={StyleSheet.absoluteFill} onPressIn={handleBackgroundPress} />
      {renderList.map((node) => {
        const coords = getIsometricCoords(node.x, node.y, SCREEN_WIDTH);
        const finalLeft = coords.left + viewOffset.x; const finalTop = coords.top + viewOffset.y;
        
        if (node.type === 'floor') {
          const floorConfig = SPRITE_CONFIG['BG-01'];
          return (
            <View key={node.id} style={[styles.tileWrapper, { left: finalLeft + (floorConfig?.offsetX || 0), top: finalTop + (floorConfig?.offsetY || 0), width: GARDEN_CONFIG.TILE_WIDTH, height: GARDEN_CONFIG.TILE_WIDTH, zIndex: node.zIndex }]} pointerEvents="none">
              <UniversalSprite itemId="BG-01" frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} />
            </View>
          );
        } else {
          const isLarge = node.type === 'large_item';
          // 元のコードの表示サイズ計算式に、環境変数のスケールを乗算
          const displaySize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
          const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
          const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
          const displayHeight = displaySize * aspectRatio;

          const tileCenterX = finalLeft + GARDEN_CONFIG.TILE_WIDTH / 2;
          const tileCenterY = finalTop + GARDEN_CONFIG.TILE_HEIGHT / 2;
          const leftPosition = tileCenterX - displaySize / 2 + (spriteDef?.offsetX || 0);
          const topPosition = tileCenterY - displayHeight + (spriteDef?.offsetY || 0);

          const isSelected = selectedItemIndex === node.originalIndex;
          const isFlipped = node.placementData?.isFlipped;

          return (
            <View key={node.id} style={{ position: 'absolute', left: leftPosition, top: topPosition, zIndex: node.zIndex }} pointerEvents="box-none">
              <View style={[styles.itemContent, isSelected && styles.selectedHighlight, isFlipped && { transform: [{ scaleX: -1 }] }]}>
                {isLarge ? (
                  <UniversalSprite itemId={node.placementData!.itemId} frameIndex={plantLevel - 1} displaySize={displaySize} />
                ) : (
                  <InteractiveGardenItem itemId={node.placementData!.itemId} displaySize={displaySize} isAnimated={true} />
                )}
              </View>
            </View>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: { width: '100%', height: 400, backgroundColor: '#E0F7FA', position: 'relative', overflow: 'hidden' },
  tileWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  itemContent: { borderRadius: 16 },
  selectedHighlight: { backgroundColor: 'rgba(255, 215, 0, 0.4)', borderWidth: 2, borderColor: '#FFD700' }
});