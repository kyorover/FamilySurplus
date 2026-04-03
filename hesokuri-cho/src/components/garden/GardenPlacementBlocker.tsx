// src/components/garden/GardenPlacementBlocker.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  isActive: boolean;
}

export const GardenPlacementBlocker: React.FC<Props> = ({ isActive }) => {
  if (!isActive) return null;
  // 配置モード中は画面全体を覆い、背景へのタッチ干渉（強制キャンセル）を物理ブロックする
  return <View style={styles.placementBlocker} pointerEvents="auto" />;
};

const styles = StyleSheet.create({
  placementBlocker: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    zIndex: 5 
  },
});