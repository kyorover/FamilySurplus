// src/components/garden/GardenWisdomTreeItem.tsx
import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
// 前回作成したスプライト切り出しコンポーネントをインポート
import { PlantSprite } from './PlantSprite';

/**
 * 検品合格したスプライトシートを使い、
 * 管理達成度（レベル）に応じて「智慧の樹」を表示するコンポーネント。
 */

// 画像ファイルを require で読み込み
// ※ assets/images/garden/ に保存されている前提
const wisdomTreeSpriteImage = require('../../../assets/images/garden/plant_wisdom_tree_sprite.png');

export const GardenWisdomTreeItem: React.FC = () => {
  // 動作確認用に、現在のレベルをStateで持たせる
  // 本番では、store.ts 等から管理達成日数に応じて計算された値を受け取る
  const [currentLevel, setCurrentLevel] = useState<number>(1);

  // 添付画像の解像度に基づき、1コマあたりのサイズを算出（仮定値）
  // 添付画像全体の横幅が約1000px、高さが約200pxだと仮定。5コマなので、1コマは200x200px。
  // ※ 実際の表示サイズは、配置時に縮小する前提。
  const FRAME_WIDTH = 200;
  const FRAME_HEIGHT = 200;

  // デバッグ用：レベルを切り替える関数
  const toggleLevel = () => {
    setCurrentLevel(prev => (prev === 5 ? 1 : prev + 1));
  };

  return (
    <View style={styles.container}>
      {/* 智慧の樹の表示 */}
      <PlantSprite
        source={wisdomTreeSpriteImage}
        level={currentLevel}
        frameWidth={FRAME_WIDTH}
        frameHeight={FRAME_HEIGHT}
        totalFrames={5}
      />

      {/* 動作確認用のデバッグボタン（本番では削除） */}
      <View style={styles.debugButtons}>
        <Button
          title={`Lv ${currentLevel} -> ${currentLevel === 5 ? 1 : currentLevel + 1}`}
          onPress={toggleLevel}
          color="#81C784"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    // 本番では position: 'absolute' でお庭グリッド上に配置される
  },
  debugButtons: {
    marginTop: 20,
    position: 'absolute',
    top: 250, // 智慧の樹の下に配置
  },
});