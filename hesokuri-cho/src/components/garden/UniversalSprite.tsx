// src/components/garden/UniversalSprite.tsx
import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

interface Props {
  itemId: string;
  frameIndex?: number; // 切り出すコマのインデックス（0始まり）
  displaySize: number; // 画面上に表示する基準サイズ（幅）
  style?: ViewStyle;
}

/**
 * スプライト画像から指定されたコマ（frameIndex）を切り出して表示する汎用コンポーネント
 */
export const UniversalSprite: React.FC<Props> = ({ 
  itemId, 
  frameIndex = 0, 
  displaySize,
  style 
}) => {
  const config = SPRITE_CONFIG[itemId];

  if (!config) {
    // 設定がない場合はプレースホルダー領域を表示
    return (
      <View style={[styles.placeholder, { width: displaySize, height: displaySize }, style]} />
    );
  }

  // アスペクト比を維持して表示用の高さを計算
  const aspectRatio = config.height / config.width;
  const displayHeight = displaySize * aspectRatio;

  // 安全対策: frameIndex が定義されているコマ数を超えないようにする
  const safeFrameIndex = Math.max(0, Math.min(frameIndex, config.frames - 1));

  return (
    <View 
      style={[
        styles.container, 
        { width: displaySize, height: displayHeight },
        style
      ]}
    >
      <Image
        source={config.source}
        style={{
          width: displaySize * config.frames, // 画像全体の表示幅
          height: displayHeight,
          // 左にずらして目的のコマを表示領域（コンテナ）の枠内に合わせる
          transform: [{ translateX: -displaySize * safeFrameIndex }],
        }}
        resizeMode="stretch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // 枠外の画像を隠す（コマ切り出しの要）
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  placeholder: {
    backgroundColor: '#CCCCCC',
    borderWidth: 1,
    borderColor: '#999999',
  }
});