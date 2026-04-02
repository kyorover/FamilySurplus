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
}

export const InteractiveGardenItem: React.FC<Props> = ({ 
  itemId, 
  displaySize, 
  isInteractive = true,
  isAnimated = false,
  onLoad
}) => {
  const config = SPRITE_CONFIG[itemId];
  const maxFrames = config ? config.frameCount : 1; 

  const [currentFrame, setCurrentFrame] = useState(0);

  const handlePress = () => {
    if (!isInteractive || maxFrames <= 1) return;
    setCurrentFrame((prev) => (prev + 1) % maxFrames);
  };

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

  return (
    <Pressable onPress={handlePress} disabled={!isInteractive || maxFrames <= 1}>
      <Animated.View style={[styles.container, { transform: [{ rotateZ: rotateInterpolate }] }]}>
        <UniversalSprite itemId={itemId} frameIndex={currentFrame} displaySize={displaySize} onLoad={onLoad} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'flex-end', alignItems: 'center' },
});