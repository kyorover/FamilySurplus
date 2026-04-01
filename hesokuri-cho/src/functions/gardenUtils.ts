// src/functions/gardenUtils.ts
import { GardenPlacement } from '../types';

export const GARDEN_CONFIG = {
  GRID_SIZE: 5,
  TILE_WIDTH: 64,
  TILE_HEIGHT: 36, // TILE_WIDTH / 2 + 4
  OFFSET_Y: 100,
};

export const getIsometricCoords = (x: number, y: number, screenWidth: number): { left: number; top: number } => {
  const offsetX = screenWidth / 2 - GARDEN_CONFIG.TILE_WIDTH / 2;
  const left = offsetX + (x - y) * (GARDEN_CONFIG.TILE_WIDTH / 2);
  const top = GARDEN_CONFIG.OFFSET_Y + (x + y) * (GARDEN_CONFIG.TILE_HEIGHT / 2);
  return { left, top };
};

/**
 * ピクセル座標（スクリーン座標）からアイソメトリックのグリッド座標（X, Y）を逆算する純粋関数
 * タッチ位置から「どのマスを触っているか」を数学的に判定します。
 */
export const getGridCoordsFromScreen = (left: number, top: number, screenWidth: number): { x: number; y: number } => {
  const offsetX = screenWidth / 2 - GARDEN_CONFIG.TILE_WIDTH / 2;
  const dx = left - offsetX;
  const dy = top - GARDEN_CONFIG.OFFSET_Y;

  const halfW = GARDEN_CONFIG.TILE_WIDTH / 2;
  const halfH = GARDEN_CONFIG.TILE_HEIGHT / 2;

  // 連立方程式を解いて X と Y を算出
  const x = Math.round((dx / halfW + dy / halfH) / 2);
  const y = Math.round((dy / halfH - dx / halfW) / 2);

  return { x, y };
};

export const getZIndexScore = (x: number, y: number, itemType: 'floor' | 'item' | 'large_item'): number => {
  const baseScore = (x + y) * 100;
  if (itemType === 'floor') return baseScore;
  // 【修正】手前の床（+200）より上に描画させるため加算値を 210 に変更
  if (itemType === 'large_item') return baseScore + 210; 
  return baseScore + 10;
};