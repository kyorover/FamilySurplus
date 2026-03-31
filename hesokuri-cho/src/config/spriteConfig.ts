// src/config/spriteConfig.ts

export type SpriteSourceId = 'tree' | 'other';

export interface SpriteDefinition {
  sourceId: SpriteSourceId;
  originalWidth: number;  // 元画像全体の幅 (px)
  originalHeight: number; // 元画像全体の高さ (px)
  startX: number;         // 左端から最初のコマまでのスキップ幅 (枠線除外用 px)
  startY: number;         // 上端から最初のコマまでのスキップ幅 (枠線除外用 px)
  frameWidth: number;     // 1コマの純粋な幅 (px)
  frameHeight: number;    // 1コマの純粋な高さ (px)
  frameCount: number;     // アニメーション/状態の総コマ数
  frameSpacingX: number;  // コマとコマの間の隙間・枠線の幅 (px)
  frameSpacingY: number;  // (複数行ある場合) 行と行の間の隙間 (px)
}

/**
 * アイテムIDごとの切り出し座標設定（環境変数の代替マスタ）
 * ※ 実際の画像のピクセル定規で測った値に後から微調整してください。
 * ※ 初期値は 1024x1024 の画像を想定した仮の分割値です。
 */
export const SPRITE_CONFIG: Record<string, SpriteDefinition> = {
  // 賢者の樹 (tree.png: 横1行 × 5列 を想定)
  'PL-01': {
    sourceId: 'tree',
    originalWidth: 772,
    originalHeight: 323,
    startX: 12,          // 左端のグレー枠を12pxスキップ
    startY: 12,         // 上部の余白をスキップして樹の根元に合わせる
    frameWidth: 140,     // 枠線を除いた純粋な絵の幅
    frameHeight: 311,    // 枠線を除いた純粋な絵の高さ
    frameCount: 5,       // 5段階成長
    frameSpacingX: 10,   // コマ間にあるグレーの枠線の太さ（10pxと仮定）
    frameSpacingY: 0,
  },
  
  // アンティークな街灯 (other.png の左上などを想定)
  'IT-01': {
    sourceId: 'other',
    originalWidth: 1024,
    originalHeight: 1024,
    startX: 12,          // 左端枠スキップ
    startY: 12,          // 上端枠スキップ
    frameWidth: 320,     // 3x3マスの1マス分の幅
    frameHeight: 320,
    frameCount: 2,       // ON/OFFの2コマが横に並んでいる想定
    frameSpacingX: 10,   // 中間の枠線幅
    frameSpacingY: 10,
  },
  
  // 木製のベンチ (other.png の別のマスを想定)
  'IT-02': {
    sourceId: 'other',
    originalWidth: 1024,
    originalHeight: 1024,
    startX: 342,         // 2列目から開始 (12 + 320 + 10)
    startY: 342,         // 2行目から開始
    frameWidth: 320,
    frameHeight: 320,
    frameCount: 1,       // 静止画
    frameSpacingX: 0,
    frameSpacingY: 0,
  },
};