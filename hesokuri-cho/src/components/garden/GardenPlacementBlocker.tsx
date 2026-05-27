// src/components/garden/GardenPlacementBlocker.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface Props {
  isActive: boolean;
}

export const GardenPlacementBlocker: React.FC<Props> = ({ isActive }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  if (!isActive) return null;
  // 配置モード中は画面全体を覆い、背景へのタッチ干渉（強制キャンセル）を物理ブロックする
  return <View style={styles.placementBlocker} pointerEvents="auto" />;
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  placementBlocker: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: colors.overlay, // ▼ 変更: テーマのオーバーレイ色を適用
    zIndex: 5 
  },
});