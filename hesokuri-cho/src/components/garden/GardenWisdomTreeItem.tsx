// src/components/garden/GardenWisdomTreeItem.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UniversalSprite } from './UniversalSprite';

/**
 * 管理達成度（レベル）に応じて「賢者の樹」のスプライトを表示するコンポーネント。
 * 新しい UniversalSprite コンポーネントと spriteConfig.ts の設定を利用します。
 */

interface GardenWisdomTreeItemProps {
  level: number;
}

export const GardenWisdomTreeItem: React.FC<GardenWisdomTreeItemProps> = ({ level }) => {
  // アプリ上で表示したいサイズ (dp)
  const DISPLAY_SIZE = 180;

  // レベル(1〜5)を、コマのインデックス(0〜4)に変換
  const frameIndex = Math.max(0, level - 1);

  return (
    <View style={styles.container}>
      <UniversalSprite
        itemId="PL-01" // spriteConfig.ts で定義した賢者の樹のID
        frameIndex={frameIndex}
        displaySize={DISPLAY_SIZE}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end', // クォータービューのマス目の下端に合わせるため
  },
});