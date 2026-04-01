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
  onMoveItem?: (index: number, newX: number, newY: number) => void; // 追加
}

type RenderNode = {
  id: string;
  type: 'floor' | 'item' | 'large_item';
  x: number;
  y: number;
  zIndex: number;
  placementData?: GardenPlacement;
  originalIndex?: number; // 追加：配列のインデックスを保持
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
      const itemType = isLargeItem ? 'large_item' : 'item';
      nodes.push({ 
        id: `item-${p.itemId}-${index}`, 
        type: itemType, 
        x: p.x, 
        y: p.y, 
        zIndex: getZIndexScore(p.x, p.y, itemType), 
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
            <Pressable
              key={node.id}
              style={[
                styles.tileWrapper,
                { 
                  left: coords.left + customOffsetX, 
                  top: coords.top + customOffsetY, 
                  width: GARDEN_CONFIG.TILE_WIDTH, 
                  height: GARDEN_CONFIG.TILE_WIDTH,
                  zIndex: node.zIndex 
                },
              ]}
              onPress={() => onPressTile && onPressTile(node.x, node.y)}
            >
              <UniversalSprite itemId="BG-01" frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} />
            </Pressable>
          );
        } else {
          const isLarge = node.type === 'large_item';
          const displaySize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * 2 : GARDEN_CONFIG.TILE_WIDTH;
          
          const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
          const customOffsetX = spriteDef?.offsetX || 0;
          const customOffsetY = spriteDef?.offsetY || 0;

          const anchorOffsetY = (isLarge ? -GARDEN_CONFIG.TILE_HEIGHT * 1.5 : -GARDEN_CONFIG.TILE_HEIGHT * 0.5) + customOffsetY;
          const translateX = (isLarge ? -GARDEN_CONFIG.TILE_WIDTH / 2 : 0) + customOffsetX;

          return (
            <View
              key={node.id}
              style={[
                styles.itemWrapper,
                { 
                  left: coords.left, 
                  top: coords.top + anchorOffsetY, 
                  transform: [{ translateX }],
                  zIndex: node.zIndex 
                },
              ]}
              pointerEvents="box-none"
            >
              <DraggableGardenItem
                index={node.originalIndex!}
                onDragRelease={(idx, dx, dy) => {
                  if (!onMoveItem) return;
                  // ドラッグの移動距離（dx, dy）を元の純粋なタイルの基準座標に足して逆算する
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
  tileWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  itemWrapper: { position: 'absolute', justifyContent: 'flex-end', alignItems: 'center' }
});