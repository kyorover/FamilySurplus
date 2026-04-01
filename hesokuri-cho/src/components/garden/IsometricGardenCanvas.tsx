// src/components/garden/IsometricGardenCanvas.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getZIndexScore, GARDEN_CONFIG } from '../../functions/gardenUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  // アイテムの配置データ（未指定の場合は空配列）
  placements?: GardenPlacement[];
}

type RenderNode = {
  id: string;
  type: 'floor' | 'item' | 'large_item';
  x: number;
  y: number;
  zIndex: number;
  placementData?: GardenPlacement;
};

/**
 * クォータービュー（アイソメトリック）の描画キャンバス
 * 床タイルとアイテムを結合し、Z-indexで動的ソートして描画する
 */
export const IsometricGardenCanvas: React.FC<Props> = ({ placements = [] }) => {
  
  // 床タイルとアイテムをまとめ、描画順（奥→手前）にソートしたリストを生成
  const renderList = useMemo(() => {
    const nodes: RenderNode[] = [];

    // 1. 床タイルデータの生成 (5x5)
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) {
        nodes.push({
          id: `floor-${x}-${y}`,
          type: 'floor',
          x,
          y,
          zIndex: getZIndexScore(x, y, 'floor'),
        });
      }
    }

    // 2. アイテムデータの追加
    placements.forEach((p, index) => {
      // 暫定的に PL-01 を 2x2マス（大型）として扱う
      const isLargeItem = p.itemId === 'PL-01';
      const itemType = isLargeItem ? 'large_item' : 'item';
      
      nodes.push({
        id: `item-${p.itemId}-${index}`,
        type: itemType,
        x: p.x,
        y: p.y,
        zIndex: getZIndexScore(p.x, p.y, itemType),
        placementData: p,
      });
    });

    // 3. Z-indexスコアに基づいてソート（昇順＝奥から手前へ）
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  return (
    <View style={styles.canvasContainer}>
      {renderList.map((node) => {
        // グリッド座標をピクセル座標に変換
        const coords = getIsometricCoords(node.x, node.y, SCREEN_WIDTH);
        
        if (node.type === 'floor') {
          return (
            <View
              key={node.id}
              style={[
                styles.tileWrapper,
                { 
                  left: coords.left, 
                  top: coords.top, 
                  width: GARDEN_CONFIG.TILE_WIDTH, 
                  height: GARDEN_CONFIG.TILE_WIDTH 
                },
              ]}
            >
              <UniversalSprite 
                itemId="BG-01" 
                frameIndex={0} 
                displaySize={GARDEN_CONFIG.TILE_WIDTH} 
              />
            </View>
          );
        } else {
          // アイテムの描画（基準点アンカーの調整）
          const isLarge = node.type === 'large_item';
          const displaySize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * 2 : GARDEN_CONFIG.TILE_WIDTH;
          
          // 1x1でも画像中心ではなく「足元」をマスの中心に合わせるためにY軸を上にシフト
          // 2x2はさらに上にシフトし、X軸も左にシフトさせて基準点を調整
          const anchorOffsetY = isLarge ? -GARDEN_CONFIG.TILE_HEIGHT * 1.5 : -GARDEN_CONFIG.TILE_HEIGHT * 0.5;
          const translateX = isLarge ? -GARDEN_CONFIG.TILE_WIDTH / 2 : 0;

          return (
            <View
              key={node.id}
              style={[
                styles.itemWrapper,
                { 
                  left: coords.left, 
                  top: coords.top + anchorOffsetY,
                  transform: [{ translateX }]
                },
              ]}
            >
              <UniversalSprite 
                itemId={node.placementData!.itemId} 
                frameIndex={0} 
                displaySize={displaySize} 
              />
            </View>
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: 400, // お庭エリアの確保高
    backgroundColor: '#E0F7FA', // 空の背景色（仮）
    position: 'relative',
    overflow: 'hidden',
  },
  tileWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemWrapper: {
    position: 'absolute',
    // アイテムは画像の下端（接地面）を基準にして配置するための設定
    justifyContent: 'flex-end',
    alignItems: 'center',
  }
});