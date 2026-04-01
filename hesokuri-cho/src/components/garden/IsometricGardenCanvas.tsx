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

  return (
    <View style={styles.canvasContainer}>
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
            >
              <Pressable style={{flex:1}} onPress={() => onPressTile && onPressTile(node.x, node.y)}>
                <UniversalSprite itemId="BG-01" frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} />
              </Pressable>
            </View>
          );
        } else {
          const isLarge = node.type === 'large_item';
          const displaySize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * 2 : GARDEN_CONFIG.TILE_WIDTH;
          
          // 画像の縦横比から高さを算出し、底面がマスの中心に合うよう正確に絶対配置を計算
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
            >
              <DraggableGardenItem
                index={node.originalIndex!}
                onDragRelease={(idx, dx, dy) => {
                  if (!onMoveItem || (Math.abs(dx) < 5 && Math.abs(dy) < 5)) return;
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