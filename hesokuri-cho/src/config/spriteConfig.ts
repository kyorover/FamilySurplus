// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export type SpriteSourceId = 'tree' | 'item1' | 'item2';

export interface SpriteDefinition {
  sourceId: SpriteSourceId;
  originalWidth: number;
  originalHeight: number;
  startX: number;
  startY: number;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameSpacingX: number;
  offsetX?: number;
  offsetY?: number;
  baseScale?: number; // ▼ 追加: お庭配置時のアイテムごとの基準縮尺（未指定は1.0）
}

export const IMAGE_SOURCES: Record<SpriteSourceId, ImageSourcePropType> = {
  tree: require('../../assets/images/garden/tree.png'),
  item1: require('../../assets/images/garden/item1.png'),
  item2: require('../../assets/images/garden/item2.png'),
};

export const GLOBAL_GARDEN_SETTINGS = {
  dropGridOffsetX: 0, 
  dropGridOffsetY: 0, 
  panSensitivity: 1.0,
  // ▼ 知恵の木関連の環境変数
  MAX_PLANT_LEVEL: 5,
  // 知恵の木の画像の表示スケール（縮尺）。
  // 以前の元のサイズは 2.0 (TILE_WIDTH * 2) 相当です。ここを変更すると画像サイズが変わります。
  TREE_SCALE: 1.5, 
  // 1回の「成長させる」ボタン押下で消費するポイント単位（上限）
  LEVEL_UP_UNIT_COST: 10,
};

export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  'PL-01': {
    sourceId: 'tree', originalWidth: 772, originalHeight: 323, startX: -1, startY: 12,
    frameWidth: 153, frameHeight: 311, frameCount: 5, frameSpacingX: 0, offsetX: -6, offsetY: 103,
    baseScale: 1.0, 
  },
  'EF-01': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 6,
    frameWidth: 78, frameHeight: 70, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0,
  },
  'EF-02': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 256,
    frameWidth: 78, frameHeight: 80, frameCount: 3, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0,
  },
  'BG-01': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 167,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0,
  },
  'IT-01': { // レトロな街灯
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 265,
    frameWidth: 84, frameHeight: 100, frameCount: 2, frameSpacingX: 0, offsetX: -5, offsetY: 40,
    baseScale: 1.0, // 例: 少し大きめに表示する
  },
  'IT-02': { // 木のベンチ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 380,
    frameWidth: 76, frameHeight: 83, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 70,
    baseScale: 0.7, // 例: 少し小さめに表示する
  },
  'IT-03': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 486,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: -4, offsetY: 80,
    baseScale: 0.6,
  },
  'IT-04': { // 秘密の宝箱
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 577,
    frameWidth: 86, frameHeight: 80, frameCount: 4, frameSpacingX: 0, offsetX: -6, offsetY: 53,
    baseScale: 1.0, // 例: 宝箱は小さく表示
  },
};