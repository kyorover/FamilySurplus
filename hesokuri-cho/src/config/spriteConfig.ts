// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export interface SpriteDefinition {
  source: ImageSourcePropType;
  width: number;  // 1コマの元のピクセル幅
  height: number; // 1コマの元のピクセル高さ
  frames: number; // 横に並んでいるコマ数
}

export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  // --- 背景・床 ---
  'BG-01': {
    source: require('../../assets/images/garden/other.png'), // 仮画像パス
    width: 64,
    height: 64,
    frames: 1,
  },
  // --- 植物（メイン） ---
  'PL-01': {
    // 賢者の樹: 成長段階に応じて5コマ横並びを想定
    source: require('../../assets/images/garden/tree.png'),
    width: 128, // 2x2マス用なので大きめ
    height: 128,
    frames: 5,
  },
  // --- 家具・装飾（1x1マス） ---
  'IT-01': {
    // 街灯: OFFとONの2コマ横並びを想定
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 2,
  },
  'IT-02': {
    // ベンチ: 1コマ
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 1,
  },
  'IT-04': {
    // 宝箱: 閉と開の2コマ横並びを想定
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 2,
  }
};