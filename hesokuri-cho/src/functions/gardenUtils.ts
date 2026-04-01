// src/functions/gardenUtils.ts
import { GardenPlacement } from '../types';

export const GARDEN_CONFIG = {
  GRID_SIZE: 5,
  TILE_WIDTH: 64,
  TILE_HEIGHT: 36, // TILE_WIDTH / 2 + 4
  OFFSET_Y: 100,
};

/**
 * グリッド座標からアイソメトリックのスクリーン座標（ピクセル）を計算する純粋関数
 * @param x グリッドX座標 (0〜4)
 * @param y グリッドY座標 (0〜4)
 * @param screenWidth 画面幅 (Dimensionsから取得)
 * @returns ピクセル座標 { left, top }
 */
export const getIsometricCoords = (x: number, y: number, screenWidth: number): { left: number; top: number } => {
  const offsetX = screenWidth / 2 - GARDEN_CONFIG.TILE_WIDTH / 2;
  const left = offsetX + (x - y) * (GARDEN_CONFIG.TILE_WIDTH / 2);
  const top = GARDEN_CONFIG.OFFSET_Y + (x + y) * (GARDEN_CONFIG.TILE_HEIGHT / 2);
  return { left, top };
};

/**
 * Z-index用の描画順序スコアを計算する純粋関数（値が小さいほど奥）
 * @param x グリッドX座標
 * @param y グリッドY座標
 * @param itemType アイテムの種別
 * @returns 描画順を決める数値スコア
 */
export const getZIndexScore = (x: number, y: number, itemType: 'floor' | 'item' | 'large_item'): number => {
  // 基本スコアは奥から手前へ (x + y) に比例
  const baseScore = (x + y) * 100;
  
  if (itemType === 'floor') {
    // 床は同じマスにあるアイテムより必ず下に描画されるようベース値そのまま
    return baseScore;
  } else if (itemType === 'large_item') {
    // 2x2の大型アイテム(賢者の樹など)は、専有するマスのうち最も奥の(x,y)を基準とするが、
    // 重なりを自然に見せるために少し手前にオフセットする
    return baseScore + 150; 
  } else {
    // 通常の1x1アイテムは床のすぐ上に描画
    return baseScore + 10;
  }
};