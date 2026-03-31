// src/config/spriteConfig.ts

export type SpriteSourceId = 'tree' | 'other';

export interface SpriteDefinition {
  sourceId: SpriteSourceId;
  originalWidth: number;  // ※RNの描画遅延を防ぐための事前定義 (元画像全体の幅 px)
  originalHeight: number; // ※同上 (元画像全体の高さ px)
  startX: number;         // 枠線を避けるための左端からの距離 (X軸の開始点 px)
  startY: number;         // 枠線を避けるための上端からの距離 (Y軸の固定点 px)
  frameWidth: number;     // 1コマの純粋な幅 (px)
  frameHeight: number;    // 1コマの純粋な高さ (px)
  frameCount: number;     // アニメーション/状態の総コマ数
  frameSpacingX: number;  // コマとコマの間の枠線幅（X軸の移動計算にのみ使用 px）
}

/**
 * アイテムIDごとの切り出し座標設定（環境変数の代替マスタ）
 * ※ other.png は横4列×縦7行のグリッドと仮定し、1マスを256x256として計算しています。
 * ※ 実際の画像のピクセル定規で測った値に後から微調整してください。
 */
export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  // --------------------------------------------------
  // 【ファイル1: tree.png】
  // --------------------------------------------------
  // PL-01: 賢者の樹 (5段階成長)
  'PL-01': {
    sourceId: 'tree',
    originalWidth: 772,
    originalHeight: 323,
    startX: 12,          
    startY: 12,          
    frameWidth: 140,     
    frameHeight: 311,    
    frameCount: 5,       
    frameSpacingX: 10,   
  },

  // --------------------------------------------------
  // 【ファイル2: other.png】
  // 仮定: 画像全体の幅1024px、1マスのサイズ256x256px、枠線幅0pxで計算
  // --------------------------------------------------
  // EF-01: 水やりエフェクト (1行目: 4コマ)
  'EF-01': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 0,            // 1行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 4,
    frameSpacingX: 0,
  },

  // EF-02: ポイント獲得の光 (2行目: 3コマ)
  'EF-02': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 256,          // 2行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 3,
    frameSpacingX: 0,
  },

  // BG-01: ベース床板（芝/レンガ） (3行目: 1コマ)
  'BG-01': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 6,
    startY: 167,          // 3行目
    frameWidth: 78,
    frameHeight: 80,
    frameCount: 1,
    frameSpacingX: 0,
  },

  // IT-01: アンティークな街灯 (4行目: 2コマ ON/OFF)
  'IT-01': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 768,          // 4行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 2,
    frameSpacingX: 0,
  },

  // IT-02: 木製のベンチ (5行目: 1コマ)
  'IT-02': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 1024,         // 5行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 1,
    frameSpacingX: 0,
  },

  // IT-03: 小さな多肉植物の鉢 (6行目: 1コマ)
  'IT-03': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 1280,         // 6行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 1,
    frameSpacingX: 0,
  },

  // IT-04: へそくり箱/宝箱 (7行目: 状態変化)
  // ※発注書では2コマですが、画像には4コマ描画されているため、frameCount: 4 としています。
  'IT-04': {
    sourceId: 'other',
    originalWidth: 342,
    originalHeight: 729,
    startX: 0,
    startY: 1536,         // 7行目
    frameWidth: 256,
    frameHeight: 256,
    frameCount: 4,        
    frameSpacingX: 0,
  },
};