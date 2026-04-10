// src/components/garden/CanvasItemNode.tsx
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { InteractiveGardenItem } from './InteractiveGardenItem';
import { EffectSprite } from './EffectSprite';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS } from '../../config/spriteConfig';
import { GARDEN_CONFIG } from '../../functions/gardenUtils';
import { RenderNode } from '../../hooks/useGardenEngine';

interface Props {
  node: RenderNode;
  finalLeft: number;
  finalTop: number;
  isSelected: boolean;
  itemLevel: number;
  activeEffectId?: string; 
  onPress: () => void;
  onLoad: () => void;
  clearActiveEffect: (itemId: string) => void;
}

export const CanvasItemNode: React.FC<Props> = ({
  node, finalLeft, finalTop, isSelected, itemLevel, activeEffectId, onPress, onLoad, clearActiveEffect
}) => {
  const isLarge = node.type === 'large_item';
  const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
  const baseScale = spriteDef?.baseScale ?? 1.0;
  
  // ▼ タイル中心座標の算出（すべての基準）
  const tileCenterX = finalLeft + GARDEN_CONFIG.TILE_WIDTH / 2;
  const tileCenterY = finalTop + GARDEN_CONFIG.TILE_HEIGHT / 2;

  // ▼ 木・アイテムの配置計算
  const baseSize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
  const displaySize = baseSize * baseScale;
  const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
  const displayHeight = displaySize * aspectRatio;
  
  // ▼ 修正: オフセットに対するスケール乗算を完全に削除。
  // さらに、文字列結合によるワープバグを防ぐため、強制的に Number() で数値化する。
  const offsetX = Number(spriteDef?.offsetX || 0);
  const offsetY = Number(spriteDef?.offsetY || 0);
  const leftPosition = tileCenterX - displaySize / 2 + offsetX;
  const topPosition = tileCenterY - displayHeight + offsetY;
  
  const safeFrameIndex = Math.max(0, Math.min(Math.floor(itemLevel) - 1, 4));

  // ▼ 反転と回転のスタイルを動的に構築
  const isFlipped = node.placementData?.isFlipped;
  const rotationDegrees = spriteDef?.rotation || 0;
  const transforms: any[] = [];
  if (isFlipped) transforms.push({ scaleX: -1 });
  if (rotationDegrees !== 0) transforms.push({ rotate: `${rotationDegrees}deg` });

  // ▼ エフェクトの配置計算（木とは独立してタイル中心基準で配置）
  const effConfig = activeEffectId ? SPRITE_CONFIG[activeEffectId] : null;
  const effScale = effConfig?.baseScale ?? 1.0;
  const effSize = GARDEN_CONFIG.TILE_WIDTH * effScale; 
  const effRatio = effConfig ? (effConfig.frameHeight / effConfig.frameWidth) : 1;
  const effHeight = effSize * effRatio;
  
  // ▼ 修正: エフェクトも同様にスケール乗算を外し、強制数値化して絶対ピクセル移動に統一。
  const effOffsetX = Number(effConfig?.offsetX || 0);
  const effOffsetY = Number(effConfig?.offsetY || 0);
  const effLeft = tileCenterX - effSize / 2 + effOffsetX;
  const effTop = tileCenterY - effHeight + effOffsetY;

  return (
    <>
      <View style={{ position: 'absolute', left: leftPosition, top: topPosition, zIndex: node.zIndex }} pointerEvents="box-none">
        <View style={[
          styles.itemContent, 
          { width: displaySize, height: displayHeight }, 
          isSelected && styles.selectedHighlight, 
          transforms.length > 0 && { transform: transforms }
        ]}>
          {isLarge ? (
            <Pressable onPress={onPress}>
              <UniversalSprite itemId={node.placementData!.itemId} frameIndex={safeFrameIndex} displaySize={displaySize} onLoad={onLoad} />
            </Pressable>
          ) : (
            <InteractiveGardenItem itemId={node.placementData!.itemId} displaySize={displaySize} isAnimated={spriteDef?.isAnimated} onLoad={onLoad} onPress={onPress} />
          )}
        </View>
      </View>

      {isLarge && activeEffectId && (
        <View style={{ position: 'absolute', left: effLeft, top: effTop, zIndex: node.zIndex + 1 }} pointerEvents="none">
          <EffectSprite 
            effectId={activeEffectId} 
            displaySize={effSize} 
            loop={false} 
            durationPerFrame={150} 
            onAnimationEnd={() => clearActiveEffect(node.placementData!.itemId)} 
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  itemContent: { borderRadius: 16 },
  selectedHighlight: { backgroundColor: 'rgba(255, 215, 0, 0.4)', borderWidth: 2, borderColor: '#FFD700' },
});