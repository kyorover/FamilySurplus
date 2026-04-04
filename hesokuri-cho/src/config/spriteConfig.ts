// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export type SpriteSourceId = 'tree1' | 'tree2' | 'item1' | 'item2' | 'item3' | 'item4' | 'chara' | 'levelup' | 'wp1' | 'wp2' | 'wp3' | 'wp4'; // ▼ 追加: 壁紙のソースID

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
  tree1: require('../../assets/images/garden/tree_1.png'),
  tree2: require('../../assets/images/garden/tree_2.png'),
  item1: require('../../assets/images/garden/item1.png'),
  item2: require('../../assets/images/garden/item2.png'),
  item3: require('../../assets/images/garden/item3.png'),
  item4: require('../../assets/images/garden/item4.png'),
  chara: require('../../assets/images/garden/chara.png'),
  levelup: require('../../assets/images/garden/levelup.png'),
  wp1: require('../../assets/images/garden/bg_1.png'),
  wp2: require('../../assets/images/garden/bg_2.png'),
  wp3: require('../../assets/images/garden/bg_3.png'),
  wp4: require('../../assets/images/garden/bg_4.png'),
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
  // ▼ 追加: デフォルトの木と壁紙・タイル
  DEFAULT_TREE_ID: 'PL-01',
  DEFAULT_TILE_ID: '',
  DEFAULT_BG_ID: 'BG-01', // ▼ 追加: デフォルトの地面タイル
  // ▼ 追加: ズーム用の環境変数
  MIN_ZOOM_SCALE: 0.5,
  MAX_ZOOM_SCALE: 2.0,
  DEFAULT_ZOOM_SCALE: 1.0,
  ZOOM_STEP: 0.2, // ▼ 1回のタップでのズーム量
};

// ...（以下、既存の SPRITE_CONFIG の定義そのまま）
export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  'PL-01': {
    sourceId: 'tree2', originalWidth: 704, originalHeight: 252, startX: 0, startY: 130,
    frameWidth: 140, frameHeight: 122, frameCount: 5, frameSpacingX: 0, offsetX:-4, offsetY: 46,
    baseScale: 1.5, isAnimated: false,
  },
  'PL-02': {
    sourceId: 'tree1', originalWidth: 752, originalHeight: 415, startX:0, startY: 143,
    frameWidth: 149, frameHeight: 142, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 52,
    baseScale: 1.5, isAnimated: false,
  },
  'PL-03': {
    sourceId: 'tree1', originalWidth: 752, originalHeight: 415, startX: -1, startY: 286,
    frameWidth: 149, frameHeight: 142, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 76,
    baseScale: 1.3, isAnimated: false,
  },
  'EF-01': { // じょうろ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 6,
    frameWidth: 86, frameHeight: 70, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: true, animationSpeed: 400,
  },
  'EF-02': { // ハンマー
    sourceId: 'item3', originalWidth: 250, originalHeight: 62, startX: 0, startY: 0,
    frameWidth: 62, frameHeight: 62, frameCount: 3, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 0.6, isAnimated: true, animationSpeed: 400,
  },
  'EF-04': { // レベルアップ
    sourceId: 'levelup', originalWidth: 415, originalHeight: 70, startX: 0, startY: 4,
    frameWidth: 69, frameHeight: 66, frameCount: 6, frameSpacingX: 0, offsetX: 0, offsetY: 40,
    baseScale: 1.0, isAnimated: true, animationSpeed: 140,
  },
  'BG-01': {
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 167,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'BG-02': {
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 6, startY: 0,
    frameWidth: 60, frameHeight: 49, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'BG-03': {
    sourceId: 'item2', originalWidth: 68, originalHeight: 369, startX: 6, startY: 50,
    frameWidth: 60, frameHeight: 45, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'BG-04': {
    sourceId: 'item4', originalWidth: 63, originalHeight: 63, startX: 3, startY: 0,
    frameWidth: 57, frameHeight: 63, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 1.0, isAnimated: false,
  },
  'IT-01': { // レトロな街灯
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 265,
    frameWidth: 84, frameHeight: 100, frameCount: 2, frameSpacingX: 0, offsetX: -5, offsetY: 40,
    baseScale: 1.0, isAnimated: true, animationSpeed: 3000,
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
    frameWidth: 58, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -6, offsetY: 78,
    baseScale: 0.5, isAnimated: true, animationSpeed: 2000,
  },
  'CR-04': { // 大人(女)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 234,
    frameWidth: 58, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -4, offsetY: 68,
    baseScale: 0.6, isAnimated: true, animationSpeed: 2000,
  },
  'CR-05': { // 大人(男)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 310,
    frameWidth: 60, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -4, offsetY: 68,
    baseScale: 0.6, isAnimated: true, animationSpeed: 2000,
  },
  'WP-01': {
    sourceId: 'wp1', originalWidth: 100, originalHeight: 100, startX: 0, startY: 0,
    frameWidth: 100, frameHeight: 100, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false,
  },
  'WP-02': {
    sourceId: 'wp2', originalWidth: 100, originalHeight: 100, startX: 0, startY: 0,
    frameWidth: 100, frameHeight: 100, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false,
  },
  'WP-03': {
    sourceId: 'wp3', originalWidth: 100, originalHeight: 100, startX: 0, startY: 0,
    frameWidth: 100, frameHeight: 100, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false,
  },
  'WP-04': {
    sourceId: 'wp4', originalWidth: 100, originalHeight: 100, startX: 0, startY: 0,
    frameWidth: 100, frameHeight: 100, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false,
  },
};