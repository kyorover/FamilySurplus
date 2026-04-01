// src/components/garden/EffectSprite.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { SPRITE_CONFIG } from '../../config/spriteConfig';

interface Props {
  effectId: string;          // 例: 'EF-01' (水やり), 'EF-02' (光)
  displaySize: number;
  durationPerFrame?: number; // 1コマの表示時間（ミリ秒）
  loop?: boolean;            // ループ再生するかどうか
  onAnimationEnd?: () => void; // ループしない場合の終了時コールバック
}

/**
 * コード側で順に画像を切り出し、アニメーションとして再生するエフェクトコンポーネント
 */
export const EffectSprite: React.FC<Props> = ({ 
  effectId, 
  displaySize, 
  durationPerFrame = 150,
  loop = true,
  onAnimationEnd
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const config = SPRITE_CONFIG[effectId];
  const maxFrames = config ? config.frames : 1;

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

    // アニメーション開始
    timer = setTimeout(tick, durationPerFrame);

    return () => clearTimeout(timer);
  }, [effectId, maxFrames, durationPerFrame, loop, onAnimationEnd]);

  if (!config) return null;

  return (
    <View style={styles.container}>
      <UniversalSprite 
        itemId={effectId} 
        frameIndex={currentFrame} 
        displaySize={displaySize} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    // 親要素のタップイベントを妨げないようにする
    pointerEvents: 'none', 
  },
});