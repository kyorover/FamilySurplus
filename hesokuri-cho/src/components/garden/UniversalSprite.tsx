// src/components/garden/UniversalSprite.tsx
import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { SPRITE_CONFIG, IMAGE_SOURCES } from '../../config/spriteConfig';

interface Props {
  itemId: string;
  frameIndex?: number;
  displaySize: number; // 画面上に表示する基準サイズ（幅）
  style?: ViewStyle;
}

/**
 * 複雑なスプライトシートから指定の座標計算（startX, startY等）を用いて
 * 正確にコマを切り出すコンポーネント
 */
export const UniversalSprite: React.FC<Props> = ({ 
  itemId, 
  frameIndex = 0, 
  displaySize,
  style 
}) => {
  const config = SPRITE_CONFIG[itemId];

  if (!config) {
    return <View style={[styles.placeholder, { width: displaySize, height: displaySize }, style]} />;
  }

  // 安全対策: frameIndex がコマ数を超えないようにする
  const safeFrameIndex = Math.max(0, Math.min(frameIndex, config.frameCount - 1));

  // 表示サイズ(displaySize)と1コマの元サイズ(frameWidth)のスケール比を計算
  const scale = displaySize / config.frameWidth;
  const displayHeight = config.frameHeight * scale;

  // X軸の切り出し開始位置を計算 (startX + (frameWidth + spacing) * index)
  const sourceX = config.startX + safeFrameIndex * (config.frameWidth + config.frameSpacingX);
  const sourceY = config.startY;

  // React Nativeで正しく切り出すため、元の画像全体をスケール倍したサイズにする
  const scaledImageWidth = config.originalWidth * scale;
  const scaledImageHeight = config.originalHeight * scale;

  // 切り出し位置もスケールに合わせてずらす
  const leftOffset = -sourceX * scale;
  const topOffset = -sourceY * scale;

  const imageSource = IMAGE_SOURCES[config.sourceId];

  return (
    <View 
      style={[
        styles.container, 
        { width: displaySize, height: displayHeight },
        style
      ]}
    >
      <Image
        source={imageSource}
        style={{
          width: scaledImageWidth,
          height: scaledImageHeight,
          position: 'absolute',
          left: leftOffset,
          top: topOffset,
        }}
        // stretchで強制的に指定サイズに引き伸ばし、コンテナ外をoverflowで隠す
        resizeMode="stretch" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    backgroundColor: '#CCCCCC',
    borderWidth: 1,
    borderColor: '#999999',
  }
});