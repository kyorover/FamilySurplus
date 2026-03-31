// src/components/garden/UniversalSprite.tsx
import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';
import { SPRITE_CONFIG, SpriteDefinition } from '../../config/spriteConfig';

/**
 * 画像ソースのマッピング
 */
const SPRITE_SOURCES = {
  tree: require('../../../assets/images/garden/tree.png'),
  other: require('../../../assets/images/garden/other.png'),
};

interface UniversalSpriteProps {
  itemId: string;        // SPRITE_CONFIG に定義されたキー (例: 'PL-01')
  frameIndex: number;    // 表示したいコマのインデックス (0始まり。Lv1なら0)
  displaySize: number;   // アプリ画面上に表示したい幅 (dp)
}

export const UniversalSprite: React.FC<UniversalSpriteProps> = ({
  itemId,
  frameIndex,
  displaySize,
}) => {
  const config = SPRITE_CONFIG[itemId];

  if (!config) {
    console.warn(`Sprite config not found for itemId: ${itemId}`);
    return <View style={[styles.fallback, { width: displaySize, height: displaySize }]} />;
  }

  // 1. 指定インデックスが総コマ数を超えないよう安全処理
  const safeFrameIndex = Math.max(0, Math.min(frameIndex, config.frameCount - 1));

  // 2. 縮尺スケールの計算
  // 画面での表示サイズ(displaySize) ÷ 設定上の1コマの幅(frameWidth)
  const scale = displaySize / config.frameWidth;

  // 3. 画面上での描画用アスペクト比計算（高さの算出）
  const displayHeight = config.frameHeight * scale;

  // 4. 画像全体のスケール適用サイズ
  const scaledImageWidth = config.originalWidth * scale;
  const scaledImageHeight = config.originalHeight * scale;

  // 5. 切り出し座標の自動計算（枠線のスキップ ＋ コマ位置の算出）
  // 基礎開始位置 + (コマの幅 + 枠線の幅) × 何コマ目か
  const cropX = config.startX + safeFrameIndex * (config.frameWidth + config.frameSpacingX);
  const cropY = config.startY; // 今回は横並び前提のためYは固定。複数行対応ならここで計算。

  // スケールに合わせた最終的な移動量 (マイナス方向へシフト)
  const translateX = -cropX * scale;
  const translateY = -cropY * scale;

  return (
    <View
      style={[
        styles.container,
        {
          width: displaySize,
          height: displayHeight,
        },
      ]}
    >
      <Image
        source={SPRITE_SOURCES[config.sourceId]}
        style={[
          styles.image,
          {
            width: scaledImageWidth,
            height: scaledImageHeight,
            transform: [
              { translateX },
              { translateY },
            ],
          } as ImageStyle,
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // 計算された1コマの枠外を完全に非表示にする
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallback: {
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
  },
});