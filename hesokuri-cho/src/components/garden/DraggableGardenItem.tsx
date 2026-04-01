// src/components/garden/DraggableGardenItem.tsx
import React, { useRef, useState } from 'react';
import { Animated, PanResponder } from 'react-native';

interface Props {
  index: number;
  onDragRelease: (index: number, dx: number, dy: number) => void;
  children?: React.ReactNode;
}

export const DraggableGardenItem: React.FC<Props> = ({ index, onDragRelease, children }) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      // 軽くタップしただけの場合は子要素（街灯のON/OFFなど）に操作を譲る
      onStartShouldSetPanResponder: () => false,
      // 指が5ピクセル以上動いた場合のみ「ドラッグ操作」として認識し、操作を奪う
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        setIsDragging(false);
        pan.flattenOffset();
        pan.setValue({ x: 0, y: 0 });
        onDragRelease(index, gestureState.dx, gestureState.dy);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        pan.flattenOffset();
        pan.setValue({ x: 0, y: 0 });
        onDragRelease(index, 0, 0);
      }
    })
  ).current;

  return (
    <Animated.View
      style={[{ transform: [{ translateX: pan.x }, { translateY: pan.y }] }]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};