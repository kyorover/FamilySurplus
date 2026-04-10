// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export type SpriteSourceId = 'tile1' | 'tile2' | 'tile3' | 'tile4' | 'tile5' | 'tile6' | 'tile7' | 'tree1' | 'item1' | 'item2' | 'item3' | 'item4' | 'item5' | 'arrow' | 'chara' | 'levelup' | 'wp1' | 'wp2' | 'wp3' | 'wp4' | 'wp5'; // ▼ 追加: 壁紙のソースID

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
  baseScale?: number; // お庭配置時のアイテムごとの基準縮尺（未指定は1.0）
  isAnimated?: boolean;     // アニメーション有無
  animationSpeed?: number;  // アニメーション速度（ms/frame）
  maxQuantity?: number;     // 追加: アイテムの最大所持数（未指定の場合はデフォルト99）
  rotation?: number;        // ▼ 追加: 画像の微調整用回転角度（度数法。未指定は0）
}

export const IMAGE_SOURCES: Record<SpriteSourceId, ImageSourcePropType> = {
  tree1: require('../../assets/images/garden/tree_1.png'),
  item1: require('../../assets/images/garden/item1.png'),
  item2: require('../../assets/images/garden/item2.png'),
  item3: require('../../assets/images/garden/item3.png'),
  item4: require('../../assets/images/garden/item4.png'),
  item5: require('../../assets/images/garden/item5.png'),
  tile1: require('../../assets/images/garden/tile_1.png'),
  tile2: require('../../assets/images/garden/tile_2.png'),
  tile3: require('../../assets/images/garden/tile_3.png'),
  tile4: require('../../assets/images/garden/tile_4.png'),
  tile5: require('../../assets/images/garden/tile_5.png'),
  tile6: require('../../assets/images/garden/tile_6.png'),
  tile7: require('../../assets/images/garden/tile_7.png'),
  arrow: require('../../assets/images/garden/arrow.png'),
  chara: require('../../assets/images/garden/chara.png'),
  levelup: require('../../assets/images/garden/levelup.png'),
  wp1: require('../../assets/images/garden/bg_1.png'),
  wp2: require('../../assets/images/garden/bg_2.png'),
  wp3: require('../../assets/images/garden/bg_3.png'),
  wp4: require('../../assets/images/garden/bg_4.png'),
  wp5: require('../../assets/images/garden/bg_5.png'),
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
  DEFAULT_BG_ID: 'BG-01',
  MIN_ZOOM_SCALE: 0.5,
  MAX_ZOOM_SCALE: 2.0,
  DEFAULT_ZOOM_SCALE: 1.0,
  ZOOM_STEP: 0.2,
  // ▼ 追加: ガーデンコントローラーのボタン間隔（中心点からの距離）。数値を大きくするとボタン間が広がる。
  CONTROLLER_SPACING: 28,
};

export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  'PL-01': {
    sourceId: 'tree1', originalWidth: 760, originalHeight: 661, startX: 0, startY: 5,
    frameWidth: 152, frameHeight: 235, frameCount: 5, frameSpacingX: 0, offsetX:0, offsetY: 84,
    baseScale: 1.4, isAnimated: false, maxQuantity: 1,
  },
  'PL-02': {
    sourceId: 'tree1', originalWidth: 760, originalHeight: 661, startX:0, startY: 247,
    frameWidth: 152, frameHeight: 222, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 82,
    baseScale: 1.4, isAnimated: false, maxQuantity: 1,
  },
  'PL-03': {
    sourceId: 'tree1', originalWidth: 760, originalHeight: 661, startX: 0, startY: 483,
    frameWidth: 152, frameHeight: 179, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 106,
    baseScale: 1.4, isAnimated: false, maxQuantity: 1,
  },
  'EF-01': { // じょうろ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 6,
    frameWidth: 86, frameHeight: 70, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: true, animationSpeed: 400,
  },
  'EF-02': { // ハンマー
    sourceId: 'item3', originalWidth: 250, originalHeight: 62, startX: 0, startY: 0,
    frameWidth: 62, frameHeight: 62, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 0.6, isAnimated: true, animationSpeed: 500,
  },
  'EF-04': { // レベルアップ
    sourceId: 'levelup', originalWidth: 415, originalHeight: 70, startX: 0, startY: 4,
    frameWidth: 69, frameHeight: 66, frameCount: 6, frameSpacingX: 0, offsetX: 0, offsetY: 40,
    baseScale: 1.0, isAnimated: true, animationSpeed: 140,
  },
  'EF-05': { // 矢印(右上)
    sourceId: 'arrow', originalWidth: 253, originalHeight: 67, startX: 0, startY: 4,
    frameWidth: 64, frameHeight: 64, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: false, animationSpeed: 0,rotation: 5,
  },
  'EF-06': { // 矢印(左下)
    sourceId: 'arrow', originalWidth: 253, originalHeight: 67, startX: 64, startY: 4,
    frameWidth: 64, frameHeight: 64, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: false, animationSpeed: 0,rotation: 5,
  },
  'EF-07': { // 矢印(左上)
    sourceId: 'arrow', originalWidth: 253, originalHeight: 67, startX: 128, startY: 4,
    frameWidth: 64, frameHeight: 64, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: false, animationSpeed: 0,rotation: 354,
  },
  'EF-08': { // 矢印(右下)
    sourceId: 'arrow', originalWidth: 253, originalHeight: 67, startX: 192, startY: 4,
    frameWidth: 64, frameHeight: 64, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 20,
    baseScale: 0.8, isAnimated: false, animationSpeed: 0,rotation: 354,
  },
  'BG-01': {
    sourceId: 'tile1', originalWidth: 82, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 82, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-02': {
    sourceId: 'tile2', originalWidth: 82, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 82, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-03': {
    sourceId: 'tile3', originalWidth: 84, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 84, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-04': {
    sourceId: 'tile4', originalWidth: 84, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 84, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-05': {
    sourceId: 'tile5', originalWidth: 84, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 84, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-06': {
    sourceId: 'tile6', originalWidth: 84, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 84, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'BG-07': {
    sourceId: 'tile7', originalWidth: 84, originalHeight: 98, startX: 0, startY: 0,
    frameWidth: 84, frameHeight: 98, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 30,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'IT-01': { // レトロな街灯
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 0, startY: 265,
    frameWidth: 84, frameHeight: 100, frameCount: 2, frameSpacingX: 0, offsetX: -5, offsetY: 40,
    baseScale: 1.0, isAnimated: true, animationSpeed: 3000,
  },
  'IT-02': { // 木のベンチ
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 380,
    frameWidth: 76, frameHeight: 83, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 46,
    baseScale: 0.7, isAnimated: false,
  },
  'IT-03': { // 多肉植物
    sourceId: 'item1', originalWidth: 342, originalHeight: 729, startX: 6, startY: 486,
    frameWidth: 78, frameHeight: 80, frameCount: 1, frameSpacingX: 0, offsetX: -4, offsetY: 48,
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
    frameWidth: 114, frameHeight: 76, frameCount: 4, frameSpacingX: 0, offsetX: -3, offsetY: 36,
    baseScale: 0.8, isAnimated: true, animationSpeed: 300, maxQuantity: 1,
  },
  'CR-02': { // 犬
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 88,
    frameWidth: 114, frameHeight: 76, frameCount: 4, frameSpacingX: 0, offsetX: -3, offsetY: 52,
    baseScale: 0.8, isAnimated: true, animationSpeed: 300, maxQuantity: 1,
  },
  'CR-03': { // 狸
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 0,
    frameWidth: 82, frameHeight: 73, frameCount: 6, frameSpacingX: 0, offsetX: 0, offsetY: 46,
    baseScale: 0.9, isAnimated: true, animationSpeed: 350, maxQuantity: 1,
  },
  'CR-04': { // 狐
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 66,
    frameWidth: 82, frameHeight: 72, frameCount: 7, frameSpacingX: 0, offsetX: 0, offsetY: 40,
    baseScale: 0.8, isAnimated: true, animationSpeed: 350, maxQuantity: 1,
  },
  'CR-05': { // パンダ
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 129,
    frameWidth: 82, frameHeight: 66, frameCount: 8, frameSpacingX: 0, offsetX: 0, offsetY: 50,
    baseScale: 1.0, isAnimated: true, animationSpeed: 350, maxQuantity: 1,
  },
  'CR-06': { // 馬
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 196,
    frameWidth: 80, frameHeight: 68, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 53,
    baseScale: 1.0, isAnimated: true, animationSpeed: 350, maxQuantity: 1,
  },
  'CR-07': { // ブルドック
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 260,
    frameWidth: 80, frameHeight: 56, frameCount: 5, frameSpacingX: 0, offsetX: 0, offsetY: 42,
    baseScale: 0.8, isAnimated: true, animationSpeed: 350, maxQuantity: 1,
  },
  'CR-200': { // 子供(男の子)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 157,
    frameWidth: 58, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: -7, offsetY: 24,
    baseScale: 0.5, isAnimated: true, animationSpeed: 2000, maxQuantity: 1,
  },
  'CR-201': { // 子供(女の子)
    sourceId: 'item5', originalWidth: 648, originalHeight: 385, startX: 0, startY: 316,
    frameWidth: 80, frameHeight: 64, frameCount: 4, frameSpacingX: 0, offsetX: 0, offsetY: 44,
    baseScale: 0.7, isAnimated: true, animationSpeed: 500, maxQuantity: 1,
  },
  'CR-210': { // 大人(女)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 234,
    frameWidth: 58, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: 0, offsetY: 52,
    baseScale: 0.6, isAnimated: true, animationSpeed: 2000, maxQuantity: 1,
  },
  'CR-211': { // 大人(男)
    sourceId: 'chara', originalWidth: 455, originalHeight: 384, startX: 0, startY: 310,
    frameWidth: 60, frameHeight: 76, frameCount: 2, frameSpacingX: 0, offsetX: 0, offsetY: 46,
    baseScale: 0.6, isAnimated: true, animationSpeed: 2000, maxQuantity: 1,
  },
  'WP-01': {
    sourceId: 'wp1', originalWidth: 976, originalHeight: 1056, startX: 0, startY: 0,
    frameWidth: 976, frameHeight: 1056, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'WP-02': {
    sourceId: 'wp2', originalWidth: 976, originalHeight: 1056, startX: 0, startY: 0,
    frameWidth: 976, frameHeight: 1056, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'WP-03': {
    sourceId: 'wp3', originalWidth: 976, originalHeight: 1056, startX: 0, startY: 0,
    frameWidth: 976, frameHeight: 1056, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'WP-04': {
    sourceId: 'wp4', originalWidth: 976, originalHeight: 1056, startX: 0, startY: 0,
    frameWidth: 976, frameHeight: 1056, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
  'WP-05': {
    sourceId: 'wp5', originalWidth: 976, originalHeight: 1056, startX: 0, startY: 0,
    frameWidth: 976, frameHeight: 1056, frameCount: 1, frameSpacingX: 0, offsetX: 0, offsetY: 0,
    baseScale: 1.0, isAnimated: false, maxQuantity: 1,
  },
};