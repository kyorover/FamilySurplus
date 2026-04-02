// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export type SpriteSourceId = 'tree' | 'item1' | 'item2' | 'chara';

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
  isAnimated?: boolean;     // ▼ 追加: アニメーション有無
  animationSpeed?: number;  // ▼ 追加: アニメーション速度（ms/frame）
}

export const IMAGE_SOURCES: Record<SpriteSourceId, ImageSourcePropType> = {
  tree: require('../../assets/images/garden/tree.png'),
  item1: require('../../assets/images/garden/item1.png'),
  item2: require('../../assets/images/garden/item2.png'),
  chara: require('../../assets/images/garden/chara.png'),
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
    sourceId: 'tree', originalWidth: 752, originalHeight: 415, startX: 0, startY: 0,
    frameWidth: 146, frameHeight: 142, frameCount: 5, frameSpacingX: 0, offsetX: 8, offsetY: 50,
    baseScale: 1.5, isAnimated: false,
  },
  'PL-02': {
    sourceId: 'tree', originalWidth: 752, originalHeight: 415, startX:0, startY: 143,
    frameWidth: 149, frameHeight: 142, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 52,
    baseScale: 1.5, isAnimated: false,
  },
  'PL-03': {
    sourceId: 'tree', originalWidth: 752, originalHeight: 415, startX: -1, startY: 286,
    frameWidth: 149, frameHeight: 142, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 76,
    baseScale: 1.3, isAnimated: false,
  },
  'EF-01': { // じょうろ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 6,
    frameWidth: 86, frameHeight: 70, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.2, isAnimated: true, animationSpeed: 150,
  },
  'EF-02': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 256,
    frameWidth: 78, frameHeight: 80, frameCount: 3, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: true, animationSpeed: 200,
  },
  'BG-03': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 167,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'BG-02': {
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 6, startY: 0,
    frameWidth: 60, frameHeight: 49, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'BG-01': {
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 6, startY: 50,
    frameWidth: 60, frameHeight: 45, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-01': { // レトロな街灯
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 265,
    frameWidth: 84, frameHeight: 100, frameCount: 2, frameSpacingX: 0, offsetX: -5, offsetY: 40,
    baseScale: 1.0, isAnimated: true, animationSpeed: 500,
  },
  'IT-02': { // 木のベンチ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 380,
    frameWidth: 76, frameHeight: 83, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 70,
    baseScale: 0.7, isAnimated: false,
  },
  'IT-03': { // 多肉植物
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 486,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: -4, offsetY: 80,
    baseScale: 0.6, isAnimated: false,
  },
  'IT-04': { // 秘密の宝箱
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 577,
    frameWidth: 86, frameHeight: 80, frameCount: 4, frameSpacingX: 0, offsetX: -6, offsetY: 53,
    baseScale: 1.0, isAnimated: true, animationSpeed: 300,
  },
  'IT-05': { // 花(黄)
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 94,
    frameWidth: 68, frameHeight: 43, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-06': { // 花(紫)
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 136,
    frameWidth: 68, frameHeight: 40, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-07': { // 花(赤)
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 174,
    frameWidth: 68, frameHeight: 40, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-08': { // 花(青)
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 214,
    frameWidth: 68, frameHeight: 40, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-09': { // 花(緑)
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 252,
    frameWidth: 68, frameHeight: 40, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-10': { // 観葉植物
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 0, startY: 290,
    frameWidth: 68, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: -3, offsetY: 53,
    baseScale: 1.0, isAnimated: false,
  },
  'CR-01': { // 猫
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 0,
    frameWidth: 114, frameHeight: 76, frameCount: 4, frameSpacingX: 0, offsetX: -3, offsetY: 56,
    baseScale: 0.8, isAnimated: true, animationSpeed: 300,
  },
  'CR-02': { // 犬
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 88,
    frameWidth: 114, frameHeight: 76, frameCount: 4, frameSpacingX: 0, offsetX: -3, offsetY: 60,
    baseScale: 0.8, isAnimated: true, animationSpeed: 300,
  },
  'CR-03': { // 子供
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 157,
    frameWidth: 114, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -3, offsetY: 46,
    baseScale: 1.0, isAnimated: true, animationSpeed: 2000,
  },
  'CR-04': { // 大人(女)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 234,
    frameWidth: 122, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -2, offsetY: 36,
    baseScale: 1.2, isAnimated: true, animationSpeed: 2000,
  },
  'CR-05': { // 大人(男)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 314,
    frameWidth: 127, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -2, offsetY: 36,
    baseScale: 1.2, isAnimated: true, animationSpeed: 2000,
  },
};