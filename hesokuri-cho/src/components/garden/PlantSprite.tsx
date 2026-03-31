// src/components/garden/PlantSprite.tsx
import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';

interface PlantSpriteProps {
  source: ImageSourcePropType;
  level: number;
  displaySize: number; // 画面上に表示したい1マスの正方形サイズ
}

export const PlantSprite: React.FC<PlantSpriteProps> = ({
  source,
  level,
  displaySize,
}) => {
  // レベルを1〜5に安全に制限
  const safeLevel = Math.max(1, Math.min(level, 5));
  
  // 3x3グリッド（3行3列）の定義
  const COLUMNS = 3;
  
  // レベル(1〜5)から、表示すべき列(col)と行(row)を算出（0インデックス）
  // Lv1: col=0, row=0 | Lv2: col=1, row=0 | Lv3: col=2, row=0
  // Lv4: col=0, row=1 | Lv5: col=1, row=1
  const zeroBasedIndex = safeLevel - 1;
  const col = zeroBasedIndex % COLUMNS;
  const row = Math.floor(zeroBasedIndex / COLUMNS);

  // マス目を表示サイズに合わせて移動させる距離
  const translateX = -(col * displaySize);
  const translateY = -(row * displaySize);

  return (
    <View
      style={[
        styles.container,
        {
          width: displaySize,
          height: displaySize,
        },
      ]}
    >
      <Image
        source={source}
        style={{
          // 画像全体のサイズを、1マスのサイズの3倍（3x3グリッド）に固定
          width: displaySize * 3,
          height: displaySize * 3,
          transform: [
            { translateX },
            { translateY }
          ],
        }}
        // 歪み防止。3x3の正方形画像が、displaySize*3の正方形領域にピッタリ収まる
        resizeMode="contain" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden', // 枠外にはみ出た他のマス目を確実に隠す
  },
});