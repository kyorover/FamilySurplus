// src/components/garden/PlantSprite.tsx
import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

/**
 * スプライトシート（横並びの複数コマ画像）から特定のコマを切り出して表示するコンポーネント。
 * 管理達成度（レベル）に応じて、1枚の画像内の表示領域をシフトさせます。
 */

interface PlantSpriteProps {
  source: ImageSourcePropType; // 例: require('../../../assets/plant_sprite.png')
  level: number;               // 現在のレベル (1〜5)
  frameWidth: number;          // 1コマあたりの幅 (px)
  frameHeight: number;         // 1コマあたりの高さ (px)
  totalFrames?: number;        // 総コマ数 (デフォルト: 5)
}

export const PlantSprite: React.FC<PlantSpriteProps> = ({
  source,
  level,
  frameWidth,
  frameHeight,
  totalFrames = 5,
}) => {
  // レベルを安全な範囲(1〜totalFrames)に収める
  const safeLevel = Math.max(1, Math.min(level, totalFrames));
  
  // 表示するコマのX座標のオフセット（左にずらす距離）
  // レベル1なら 0、レベル2なら -frameWidth ...
  const translateX = -(safeLevel - 1) * frameWidth;

  return (
    <View
      style={[
        styles.container,
        {
          width: frameWidth,
          height: frameHeight,
        },
      ]}
    >
      <Image
        source={source}
        style={{
          width: frameWidth * totalFrames, // スプライトシート全体の幅
          height: frameHeight,
          transform: [{ translateX }],     // 目的のコマまで画像を左にスライド
        }}
        resizeMode="stretch" // ピクセルアートの崩れを防ぐため実寸表示を維持
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // 枠外にはみ出た他のコマを隠す
    justifyContent: 'center',
    alignItems: 'center',
    // 配置時のドラッグ＆ドロップコンポーネント（DraggableGardenItem）と組み合わせる前提
  },
});