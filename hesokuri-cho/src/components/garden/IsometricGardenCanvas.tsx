// src/components/garden/IsometricGardenCanvas.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { InteractiveGardenItem } from './InteractiveGardenItem';
import { DraggableGardenItem } from './DraggableGardenItem';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getGridCoordsFromScreen, getZIndexScore, GARDEN_CONFIG } from '../../functions/gardenUtils';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  placements?: GardenPlacement[];
  onPressTile?: (x: number, y: number) => void;
  onMoveItem?: (index: number, newX: number, newY: number) => void;
}

type RenderNode = {
  id: string;
  type: 'floor' | 'item' | 'large_item';
  x: number;
  y: number;
  zIndex: number;
  placementData?: GardenPlacement;
  originalIndex?: number;
};

export const IsometricGardenCanvas: React.FC<Props> = ({ placements = [], onPressTile, onMoveItem }) => {
  const renderList = useMemo(() => {
    const nodes: RenderNode[] = [];
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) {
        nodes.push({ id: `floor-${x}-${y}`, type: 'floor', x, y, zIndex: getZIndexScore(x, y, 'floor') });
      }
    }
    placements.forEach((p, index) => {
      const isLargeItem = p.itemId === 'PL-01';
      nodes.push({ 
        id: `item-${p.itemId}-${index}`, 
        type: isLargeItem ? 'large_item' : 'item', 
        x: p.x, 
        y: p.y, 
        zIndex: getZIndexScore(p.x, p.y, isLargeItem ? 'large_item' : 'item'), 
        placementData: p,
        originalIndex: index 
      });
    });
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  // 背景全体を覆う透明なタップ判定レイヤーのハンドラ
  const handleBackgroundPress = (e: any) => {
    if (!onPressTile) return;
    const { locationX, locationY } = e.nativeEvent;
    // タッチしたピクセル座標から、アイソメトリックのグリッド座標(X, Y)を数学的に逆算
    const grid = getGridCoordsFromScreen(locationX, locationY, SCREEN_WIDTH);
    
    // 盤面内のタップであれば親へ通知
    if (grid.x >= 0 && grid.x < GARDEN_CONFIG.GRID_SIZE && grid.y >= 0 && grid.y < GARDEN_CONFIG.GRID_SIZE) {
      onPressTile(grid.x, grid.y);
    }
  };

  return (
    <View style={styles.canvasContainer}>
      {/* 床の重なり干渉を防ぐため、一番奥に巨大なタップ判定エリアを敷く */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleBackgroundPress} />

      {renderList.map((node) => {
        const coords = getIsometricCoords(node.x, node.y, SCREEN_WIDTH);
        
        if (node.type === 'floor') {
          const floorConfig = SPRITE_CONFIG['BG-01'];
          const customOffsetX = floorConfig?.offsetX || 0;
          const customOffsetY = floorConfig?.offsetY || 0;

          return (
            <View
              key={node.id}
              style={[
                styles.tileWrapper,
                { left: coords.left + customOffsetX, top: coords.top + customOffsetY, width: GARDEN_CONFIG.TILE_WIDTH, height: GARDEN_CONFIG.TILE_WIDTH, zIndex: node.zIndex },
              ]}
              // 個別の床タイルはタッチ判定を持たず、背景の巨大Pressableに貫通させる
              pointerEvents="none"
            >
              <UniversalSprite itemId="BG-01" frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} />
            </View>
          );
        } else {
          const isLarge = node.type === 'large_item';
          const displaySize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * 2 : GARDEN_CONFIG.TILE_WIDTH;
          const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
          
          const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
          const displayHeight = displaySize * aspectRatio;

          const tileCenterX = coords.left + GARDEN_CONFIG.TILE_WIDTH / 2;
          const tileCenterY = coords.top + GARDEN_CONFIG.TILE_HEIGHT / 2;

          const leftPosition = tileCenterX - displaySize / 2 + (spriteDef?.offsetX || 0);
          const topPosition = tileCenterY - displayHeight + (spriteDef?.offsetY || 0);

          return (
            <View
              key={node.id}
              style={{ position: 'absolute', left: leftPosition, top: topPosition, zIndex: node.zIndex }}
              pointerEvents="box-none"
            >
              <DraggableGardenItem
                index={node.originalIndex!}
                onDragRelease={(idx, dx, dy) => {
                  if (!onMoveItem || (Math.abs(dx) < 5 && Math.abs(dy) < 5)) return;
                  // ドラッグされた距離(dx, dy)を加算して新しいマス目を計算
                  const newGrid = getGridCoordsFromScreen(coords.left + dx, coords.top + dy, SCREEN_WIDTH);
                  onMoveItem(idx, newGrid.x, newGrid.y);
                }}
              >
                {isLarge ? (
                  <UniversalSprite itemId={node.placementData!.itemId} frameIndex={4} displaySize={displaySize} />
                ) : (
                  <InteractiveGardenItem itemId={node.placementData!.itemId} displaySize={displaySize} isAnimated={true} />
                )}
              </DraggableGardenItem>
            </View>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: { width: '100%', height: 400, backgroundColor: '#E0F7FA', position: 'relative', overflow: 'hidden' },
  tileWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' }
});