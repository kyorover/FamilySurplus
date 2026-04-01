// src/components/garden/DraggableGardenItem.tsx
import React, { useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet } from 'react-native';

interface DraggableGardenItemProps {
  index: number;
  onDragRelease: (index: number, dx: number, dy: number) => void;
  children?: React.ReactNode;
}

export const DraggableGardenItem: React.FC<DraggableGardenItemProps> = ({
  index,
  onDragRelease,
  children,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      
      onPanResponderRelease: (e, gestureState) => {
        setIsDragging(false);
        // ドロップしたらアニメーションオフセットをリセット（親からの再描画で位置が確定するため）
        pan.flattenOffset();
        pan.setValue({ x: 0, y: 0 });
        
        onDragRelease(index, gestureState.dx, gestureState.dy);
      },
      
      onPanResponderGrant: () => {
        setIsDragging(true);
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
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          // ドラッグ中は他のアイテムの上に表示されるようにする
          zIndex: isDragging ? 1000 : 1,
          elevation: isDragging ? 1000 : 0,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
    </Animated.View>
  );
};