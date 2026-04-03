// src/components/garden/IsometricGardenCanvas.tsx
import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable, PanResponder, ActivityIndicator, Text, Image } from 'react-native';
import { UniversalSprite } from './UniversalSprite';
import { InteractiveGardenItem } from './InteractiveGardenItem';
import { EffectSprite } from './EffectSprite';
import { GardenPlacement } from '../../types';
import { getIsometricCoords, getGridCoordsFromScreen, getZIndexScore, GARDEN_CONFIG } from '../../functions/gardenUtils';
import { SPRITE_CONFIG, GLOBAL_GARDEN_SETTINGS, IMAGE_SOURCES } from '../../config/spriteConfig';
import { useHesokuriStore } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_HEIGHT = 400; // ▼ 追加: キャンバスの高さを定数化し、壁紙の敷き詰めに利用

interface Props {
  placements?: GardenPlacement[];
  onPressTile?: (x: number, y: number) => void;
  selectedItemIndex?: number | null;
  viewOffset?: { x: number; y: number };
  onPanMove?: (dx: number, dy: number) => void;
  onPanRelease?: (dx: number, dy: number) => void;
  plantLevel?: number; // 知恵の木レベル(1-5)
  onLoadComplete?: () => void; // ロード完了通知
}

type RenderNode = { id: string; type: 'floor' | 'item' | 'large_item'; x: number; y: number; zIndex: number; placementData?: GardenPlacement; originalIndex?: number; };

export const IsometricGardenCanvas: React.FC<Props> = ({ 
  placements = [], onPressTile, selectedItemIndex, viewOffset = { x: 0, y: 0 }, onPanMove, onPanRelease, plantLevel = 1, onLoadComplete
}) => {
  const { settings } = useHesokuriStore();
  const [showWateringEffect, setShowWateringEffect] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ▼追加: ローディング状態
  const prevExpRef = useRef(settings?.plantExp || 0);

  // ▼ 水やりエフェクトの検知
  useEffect(() => {
    const currentExp = settings?.plantExp || 0;
    if (currentExp > prevExpRef.current) {
      setShowWateringEffect(true);
    }
    prevExpRef.current = currentExp;
  }, [settings?.plantExp]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => selectedItemIndex === null && (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10),
      onPanResponderMove: (_, gs) => { if (selectedItemIndex === null && onPanMove) onPanMove(gs.dx, gs.dy); },
      onPanResponderRelease: (_, gs) => { if (selectedItemIndex === null && onPanRelease) onPanRelease(gs.dx, gs.dy); }
    })
  ).current;

  // ▼ 動的背景の取得
  const bgPlacement = placements.find(p => p.itemId.startsWith('BG-'));
  const bgItemId = bgPlacement ? bgPlacement.itemId : 'BG-01';

  // ▼ 壁紙の取得
  const wpPlacement = placements.find(p => p.itemId.startsWith('WP-'));
  const wpItemId = wpPlacement ? wpPlacement.itemId : null;
  const wpSprite = wpItemId ? SPRITE_CONFIG[wpItemId] : null;
  const wpImageSource = wpSprite ? IMAGE_SOURCES[wpSprite.sourceId] : null;

  const renderList = useMemo(() => {
    const nodes: RenderNode[] = [];
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) nodes.push({ id: `floor-${x}-${y}`, type: 'floor', x, y, zIndex: getZIndexScore(x, y, 'floor') });
    }
    placements.forEach((p, index) => {
      if (p.itemId.startsWith('BG-') || p.itemId.startsWith('WP-')) return; // 背景・壁紙は床レイヤー等として描画するため除外
      const isLargeItem = p.itemId.startsWith('PL-');
      nodes.push({ id: `item-${p.itemId}-${index}`, type: isLargeItem ? 'large_item' : 'item', x: p.x, y: p.y, zIndex: getZIndexScore(p.x, p.y, isLargeItem ? 'large_item' : 'item'), placementData: p, originalIndex: index });
    });
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  // ▼ アイテム構成（種類と数）の変更を検知する文字列（座標移動、反転、レベルアップ等では変化させない）
  const itemConfigString = useMemo(() => {
    return placements.map(p => p.itemId).sort().join(',');
  }, [placements]);

  // ▼ 画像のロード完了検知ロジック
  const totalImages = renderList.length;
  const loadedCountRef = useRef(0);

  // アイテム構成が変わったらローディングをONにする
  useEffect(() => {
    setIsLoading(true);
    loadedCountRef.current = 0;
  }, [itemConfigString]);

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (loadedCountRef.current >= totalImages) {
      setIsLoading(false); // 全てロード完了したら非表示
      if (onLoadComplete) onLoadComplete();
    }
  }, [totalImages, onLoadComplete]);

  // ▼ フェールセーフ: タイムアウトで強制的にローディングを解除
  useEffect(() => {
    loadedCountRef.current = 0; // リセット
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadComplete) onLoadComplete();
    }, 1500); // 1.5秒で強制解除（長すぎないように調整）
    return () => clearTimeout(fallbackTimer);
  }, [itemConfigString, onLoadComplete]);

  const handleBackgroundPress = (e: any) => {
    if (!onPressTile) return;
    const { locationX, locationY } = e.nativeEvent;
    const grid = getGridCoordsFromScreen(locationX - viewOffset.x, locationY - viewOffset.y, SCREEN_WIDTH);
    if (grid.x >= 0 && grid.x < GARDEN_CONFIG.GRID_SIZE && grid.y >= 0 && grid.y < GARDEN_CONFIG.GRID_SIZE) onPressTile(grid.x, grid.y);
  };

  return (
    <View style={[styles.canvasContainer, !wpImageSource && { backgroundColor: '#E0F7FA' }]} {...panResponder.panHandlers}>
      {/* ▼ 壁紙の敷き詰め描画（不具合回避のため幅と高さを明示して確実にリピートさせる） */}
      {wpImageSource && (
        <View style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: CANVAS_HEIGHT, overflow: 'hidden' }}>
          <Image 
            source={wpImageSource} 
            style={{ width: SCREEN_WIDTH, height: CANVAS_HEIGHT }} 
            resizeMode="repeat" 
          />
        </View>
      )}

      <Pressable style={StyleSheet.absoluteFill} onPressIn={handleBackgroundPress} />
      
      {renderList.map((node) => {
        const coords = getIsometricCoords(node.x, node.y, SCREEN_WIDTH);
        const finalLeft = coords.left + viewOffset.x; const finalTop = coords.top + viewOffset.y;
        
        if (node.type === 'floor') {
          const floorConfig = SPRITE_CONFIG[bgItemId];
          return (
            <View key={node.id} style={[styles.tileWrapper, { left: finalLeft + (floorConfig?.offsetX || 0), top: finalTop + (floorConfig?.offsetY || 0), width: GARDEN_CONFIG.TILE_WIDTH, height: GARDEN_CONFIG.TILE_WIDTH, zIndex: node.zIndex }]} pointerEvents="none">
              <UniversalSprite itemId={bgItemId} frameIndex={0} displaySize={GARDEN_CONFIG.TILE_WIDTH} onLoad={handleImageLoad} />
            </View>
          );
        } else {
          const isLarge = node.type === 'large_item';
          const spriteDef = SPRITE_CONFIG[node.placementData!.itemId];
          
          const baseScale = spriteDef?.baseScale ?? 1.0;
          const baseSize = isLarge ? GARDEN_CONFIG.TILE_WIDTH * GLOBAL_GARDEN_SETTINGS.TREE_SCALE : GARDEN_CONFIG.TILE_WIDTH;
          const displaySize = baseSize * baseScale;
          
          const aspectRatio = spriteDef ? (spriteDef.frameHeight / spriteDef.frameWidth) : 1;
          const displayHeight = displaySize * aspectRatio;

          const tileCenterX = finalLeft + GARDEN_CONFIG.TILE_WIDTH / 2;
          const tileCenterY = finalTop + GARDEN_CONFIG.TILE_HEIGHT / 2;

          const scaledOffsetX = (spriteDef?.offsetX || 0) * baseScale;
          const scaledOffsetY = (spriteDef?.offsetY || 0) * baseScale;

          const leftPosition = tileCenterX - displaySize / 2 + scaledOffsetX;
          const topPosition = tileCenterY - displayHeight + scaledOffsetY;

          const isSelected = selectedItemIndex === node.originalIndex;
          const isFlipped = node.placementData?.isFlipped;

          return (
            <View key={node.id} style={{ position: 'absolute', left: leftPosition, top: topPosition, zIndex: node.zIndex }} pointerEvents="box-none">
              <View style={[styles.itemContent, isSelected && styles.selectedHighlight, isFlipped && { transform: [{ scaleX: -1 }] }]}>
                {isLarge ? (
                  <UniversalSprite itemId={node.placementData!.itemId} frameIndex={plantLevel - 1} displaySize={displaySize} onLoad={handleImageLoad} />
                ) : (
                  <InteractiveGardenItem itemId={node.placementData!.itemId} displaySize={displaySize} isAnimated={spriteDef?.isAnimated} onLoad={handleImageLoad} />
                )}
              </View>
              {/* ▼ 水やりエフェクトの表示（知恵の木の上） */}
              {isLarge && showWateringEffect && (
                <View style={styles.effectOverlay}>
                  <EffectSprite effectId="EF-01" displaySize={displaySize * 0.8} loop={false} durationPerFrame={150} onAnimationEnd={() => setShowWateringEffect(false)} />
                </View>
              )}
            </View>
          );
        }
      })}

      {/* ▼ ローディング時の目隠しオーバーレイ */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>ガーデンを準備中...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: { width: '100%', height: CANVAS_HEIGHT, position: 'relative', overflow: 'hidden' },
  tileWrapper: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  itemContent: { borderRadius: 16 },
  selectedHighlight: { backgroundColor: 'rgba(255, 215, 0, 0.4)', borderWidth: 2, borderColor: '#FFD700' },
  effectOverlay: { position: 'absolute', top: -40, left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(224, 247, 250, 0.9)', // 背景色に合わせて少し透過させる
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#00695C',
    fontWeight: 'bold',
  }
});