// src/components/garden/InteractiveGardenItem.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

interface Props {
  itemId: string;
  displaySize: number;
  isInteractive?: boolean;
  isAnimated?: boolean;
  onLoad?: () => void; // 追加
  onPress?: () => void; // ▼ 追加: 親へタップを通知するためのコールバック
}

export const InteractiveGardenItem: React.FC<Props> = ({ 
  itemId, 
  displaySize, 
  isInteractive = true,
  isAnimated = false,
  onLoad,
  onPress // ▼ 追加
}) => {
  const config = SPRITE_CONFIG[itemId];
  const maxFrames = config ? config.frameCount : 1; 
  const animationSpeed = config?.animationSpeed || 200; // 未指定時のデフォルト速度

  const [currentFrame, setCurrentFrame] = useState(0);

  const handlePress = () => {
    if (onPress) onPress(); // ▼ 追加: アイテム選択機能のために親へ通知
    if (!isInteractive || maxFrames <= 1) return; // コマ送り自体は条件を満たさないと実行しない
    setCurrentFrame((prev) => (prev + 1) % maxFrames);
  };

  // ▼ 追加: スプライトの自動コマ送りアニメーション
  useEffect(() => {
    let timer: NodeJS.Timeout;
    // アニメーションON、かつ複数コマ存在する場合のみ実行
    if (isAnimated && maxFrames > 1) {
      timer = setInterval(() => {
        setCurrentFrame((prev) => (prev + 1) % maxFrames);
      }, animationSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnimated, maxFrames, animationSpeed]);

  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isAnimated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotation, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotation, { toValue: -1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(rotation, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
        ])
      ).start();
    } else {
      rotation.setValue(0);
      rotation.stopAnimation();
    }
    return () => rotation.stopAnimation();
  }, [isAnimated, rotation]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg']
  });

  // ▼ 修正: disabled条件を外し、すべてのアイテムで選択用タップを受け取れるように変更
  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ rotateZ: rotateInterpolate }] }]}>
        <UniversalSprite itemId={itemId} frameIndex={currentFrame} displaySize={displaySize} onLoad={onLoad} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'flex-end', alignItems: 'center' },
});