// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export type SpriteSourceId = 'tree' | 'other';

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
}

export const IMAGE_SOURCES: Record<SpriteSourceId, ImageSourcePropType> = {
  tree: require('../../assets/images/garden/tree.png'),
  other: require('../../assets/images/garden/other.png'),
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
};

export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  'PL-01': {
    sourceId: 'tree', originalWidth: 772, originalHeight: 323, startX: -1, startY: 12,
    frameWidth: 153, frameHeight: 311, frameCount: 5, frameSpacingX: 0, offsetX: -6, offsetY: 103,
  },
  'EF-01': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 6, startY: 0,
    frameWidth: 256, frameHeight: 256, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 20,
  },
  'EF-02': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 0, startY: 256,
    frameWidth: 256, frameHeight: 256, frameCount: 3, frameSpacingX: 0, offsetX: 0, offsetY: 20,
  },
  'BG-01': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 6, startY: 167,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
  },
  'IT-01': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 0, startY: 265,
    frameWidth: 84, frameHeight: 100, frameCount: 2, frameSpacingX: 0, offsetX: -5, offsetY: 40,
  },
  'IT-02': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 6, startY: 380,
    frameWidth: 76, frameHeight: 83, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 47,
  },
  'IT-03': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 6, startY: 486,
    frameWidth: 80, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
  },
  'IT-04': {
    sourceId: 'other', originalWidth: 342, originalHeight: 729, startX: 0, startY: 577,
    frameWidth: 86, frameHeight: 80, frameCount: 4, frameSpacingX: 0, offsetX: -6, offsetY: 53,
  },
};