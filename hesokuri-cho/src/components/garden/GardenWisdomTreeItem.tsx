// src/components/garden/GardenWisdomTreeItem.tsx
import React from 'react';
import { UniversalSprite } from './UniversalSprite';

interface Props {
  plantLevel: number; // 0〜4 の5段階を想定
  displaySize: number;
}

/**
 * 賢者の樹（PL-01）の表示コンポーネント
 * 外部から渡された plantLevel（月間予算の達成度など）に応じて表示するコマを切り替える単一責務コンポーネント
 */
export const GardenWisdomTreeItem: React.FC<Props> = ({ plantLevel, displaySize }) => {
  // plantLevelが0〜4の範囲に収まるように正規化
  const normalizedLevel = Math.max(0, Math.min(Math.floor(plantLevel), 4));

  return (
    <UniversalSprite
      itemId="PL-01"
      frameIndex={normalizedLevel} // 成長レベル＝コマ番号
      displaySize={displaySize}
    />
  );
};