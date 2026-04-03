// src/components/garden/EffectSprite.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

interface Props {
  effectId: string;
  displaySize: number;
  durationPerFrame?: number;
  loop?: boolean;
  onAnimationEnd?: () => void;
}

export const EffectSprite: React.FC<Props> = ({ 
  effectId, 
  displaySize, 
  durationPerFrame = 150,
  loop = true,
  onAnimationEnd
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const config = SPRITE_CONFIG[effectId];
  const maxFrames = config ? config.frameCount : 1; 

  useEffect(() => {
    if (maxFrames <= 1) return;

    let timer: NodeJS.Timeout;
    let frame = 0;

    const tick = () => {
      frame++;
      if (frame >= maxFrames) {
        if (loop) {
          frame = 0;
        } else {
          if (onAnimationEnd) onAnimationEnd();
          return;
        }
      }
      setCurrentFrame(frame);
      timer = setTimeout(tick, durationPerFrame);
    };

    timer = setTimeout(tick, durationPerFrame);
    return () => clearTimeout(timer);
  }, [effectId, maxFrames, durationPerFrame, loop, onAnimationEnd]);

  if (!config) return null;

  // ▼ 追加: spriteConfig.ts に定義されたエフェクト固有の baseScale を適用して最終サイズを算出
  const scaledDisplaySize = displaySize * (config.baseScale ?? 1.0);

  return (
    <View style={styles.container}>
      <UniversalSprite 
        itemId={effectId} 
        frameIndex={currentFrame} 
        displaySize={scaledDisplaySize} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none', 
  },
});