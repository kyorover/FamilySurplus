// src/components/garden/InteractiveGardenItem.tsx
import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

interface Props {
  itemId: string;
  displaySize: number;
  isInteractive?: boolean; // タップで状態(コマ)を切り替えるか
  isAnimated?: boolean;    // 風で揺れるアニメーションを付与するか
}

/**
 * タップによる状態切り替え（街灯ON/OFFなど）と、
 * Reanimatedによる微細な揺れアニメーションを担うコンポーネント
 */
export const InteractiveGardenItem: React.FC<Props> = ({ 
  itemId, 
  displaySize, 
  isInteractive = true,
  isAnimated = false
}) => {
  const config = SPRITE_CONFIG[itemId];
  const maxFrames = config ? config.frames : 1;

  // 現在表示しているコマ番号
  const [currentFrame, setCurrentFrame] = useState(0);

  // タップハンドラ: コマを順に切り替え、最後までいったら最初に戻る
  const handlePress = () => {
    if (!isInteractive || maxFrames <= 1) return;
    setCurrentFrame((prev) => (prev + 1) % maxFrames);
  };

  // --- Reanimated による揺れアニメーション ---
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isAnimated) {
      // 左右に少しだけ回転する動きを無限ループで滑らかに実行
      rotation.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // 無限ループ
        true // リバース再生
      );
    } else {
      rotation.value = 0;
    }
  }, [isAnimated, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  return (
    <Pressable onPress={handlePress} disabled={!isInteractive || maxFrames <= 1}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <UniversalSprite 
          itemId={itemId} 
          frameIndex={currentFrame} 
          displaySize={displaySize} 
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});