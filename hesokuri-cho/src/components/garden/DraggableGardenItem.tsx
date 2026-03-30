// src/components/garden/DraggableGardenItem.tsx
import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

/**
 * 外部参照: React Native 組み込みの Animated, PanResponder を使用。
 * 追加ライブラリ不要でドラッグ＆ドロップを実現します。
 */

export interface GardenItemPlacement {
  id: string;
  itemId: string;
  x: number;
  y: number;
}

interface DraggableGardenItemProps {
  placement: GardenItemPlacement;
  // TODO: 本番ではここに imageSource 等の画像アセットパスを渡す
  onDragRelease: (id: string, newX: number, newY: number) => void;
  children?: React.ReactNode; // 画像やアイコンを内包させる
}

export const DraggableGardenItem: React.FC<DraggableGardenItemProps> = ({
  placement,
  onDragRelease,
  children,
}) => {
  // アニメーション用のXY座標値（初期位置をセット）
  const pan = useRef(new Animated.ValueXY({ x: placement.x, y: placement.y })).current;

  // ドラッグ操作のハンドラー設定
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      // ドラッグ中の動きを Animated.Value に紐付け
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false } // PanResponderのXYトラッキングではfalseが必須
      ),
      
      // ドラッグ終了時（指を離した時）の処理
      onPanResponderRelease: (e, gestureState) => {
        // 現在の絶対座標を計算して親へ通知（状態保存用）
        // ※ initial value + drag distance
        const newX = placement.x + gestureState.dx;
        const newY = placement.y + gestureState.dy;
        
        // 次回のドラッグ開始位置をリセット（オフセットを現在の値に統合）
        pan.flattenOffset();
        
        onDragRelease(placement.id, newX, newY);
      },
      
      // ドラッグ開始時
      onPanResponderGrant: () => {
        // 現在の位置から相対移動を開始するためにオフセットを設定
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children ? (
        children
      ) : (
        // デフォルトのプレースホルダー（画像が渡されなかった場合）
        <View style={styles.placeholder} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // 親要素（お庭エリア）内での絶対配置
    zIndex: 10,
  },
  placeholder: {
    width: 48,
    height: 48,
    backgroundColor: '#81C784',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#388E3C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});