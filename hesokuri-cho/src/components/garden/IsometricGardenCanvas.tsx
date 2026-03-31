// src/components/garden/IsometricGardenCanvas.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { UniversalSprite } from './UniversalSprite';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * クォータービュー（アイソメトリック）のベースとなる5x5グリッドキャンバス
 */
export const IsometricGardenCanvas: React.FC = () => {
  // グリッドの設定
  const GRID_SIZE = 5;
  
  // 床板1枚の表示サイズ（dp）。画像のサイズ感に合わせてここで微調整します。
  const TILE_WIDTH = 64; 
  // アイソメトリックの縦幅は基本的に横幅の半分（1:2のパース）
  const TILE_HEIGHT = TILE_WIDTH / 2+4; // 32

  // キャンバスの中心を画面中央に合わせるためのオフセット
  const OFFSET_X = SCREEN_WIDTH / 2 - TILE_WIDTH / 2;
  const OFFSET_Y = 100; // 上部からの余白

  // 5x5のマス目データ（0〜4のX, Y座標）を生成
  const tiles: { x: number; y: number }[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      tiles.push({ x, y });
    }
  }

  // 奥にあるマス（x+yが小さい）から順に描画するためソート（Z-indexの破綻防止）
  tiles.sort((a, b) => a.x + a.y - (b.x + b.y));

  return (
    <View style={styles.canvasContainer}>
      {tiles.map((tile) => {
        // アイソメトリック座標変換（ピクセル計算）
        const screenX = OFFSET_X + (tile.x - tile.y) * (TILE_WIDTH / 2);
        const screenY = OFFSET_Y + (tile.x + tile.y) * (TILE_HEIGHT / 2);

        return (
          <View
            key={`tile-${tile.x}-${tile.y}`}
            style={[
              styles.tileWrapper,
              {
                left: screenX,
                top: screenY,
                // 画像自体は正方形のキャンバスに乗っているため、枠はWIDTHで統一する
                width: TILE_WIDTH,
                height: TILE_WIDTH, 
              },
            ]}
          >
            {/* CSSの仮床板を完全廃止し、UniversalSpriteに差し替え。
              spriteConfig.ts で定義した BG-01 を呼び出す。
            */}
            <UniversalSprite
              itemId="BG-01"
              frameIndex={0}
              displaySize={TILE_WIDTH}
            />
          </View>
        );
      })}

      {/* 今後、ここにIT-01（街灯）やPL-01（賢者の樹）を配置する要素を追加します */}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: 400, // お庭エリアの高さ
    backgroundColor: '#E0F7FA', // 空の背景色（仮）
    position: 'relative',
    overflow: 'hidden',
  },
  tileWrapper: {
    position: 'absolute',
    // タイル画像を枠内のどこに配置するか（基本的に中央寄せ）
    justifyContent: 'center',
    alignItems: 'center',
  },
});