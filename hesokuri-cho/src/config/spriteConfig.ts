// src/config/spriteConfig.ts
import { ImageSourcePropType } from 'react-native';

export interface SpriteDefinition {
  source: ImageSourcePropType;
  width: number;  
  height: number; 
  frames: number; 
}

export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  // --- 背景・床 ---
  'BG-01': {
    source: require('../../assets/images/garden/other.png'), 
    width: 64,
    height: 64,
    frames: 1,
  },
  // --- 植物（メイン） ---
  'PL-01': {
    source: require('../../assets/images/garden/tree.png'),
    width: 128, 
    height: 128,
    frames: 5,
  },
  // --- 家具・装飾（1x1マス） ---
  'IT-01': {
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 2, // 街灯: OFF/ON
  },
  'IT-02': {
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 1, // ベンチ
  },
  'IT-04': {
    source: require('../../assets/images/garden/other.png'),
    width: 64,
    height: 64,
    frames: 2, // 宝箱: 閉/開
  },
  // --- エフェクト ---
  'EF-01': {
    // 水やりエフェクト: 4コマ
    source: require('../../assets/images/garden/other.png'), // 仮画像
    width: 64,
    height: 64,
    frames: 4,
  },
  'EF-02': {
    // ポイント獲得の光: 3コマ
    source: require('../../assets/images/garden/other.png'), // 仮画像
    width: 64,
    height: 64,
    frames: 3,
  }
};