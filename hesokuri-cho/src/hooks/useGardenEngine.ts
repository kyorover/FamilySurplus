// src/hooks/useGardenEngine.ts
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PanResponder } from 'react-native';
import { useHesokuriStore } from '../store';
import { GardenPlacement } from '../types';
import { getZIndexScore, GARDEN_CONFIG } from '../functions/gardenUtils';
import { ALL_GARDEN_ITEMS } from '../constants/gardenItems';

export type RenderNode = { 
  id: string; type: 'floor' | 'item' | 'large_item'; 
  x: number; y: number; zIndex: number; 
  placementData?: GardenPlacement; originalIndex?: number; 
};

export const useGardenEngine = (
  placements: GardenPlacement[],
  selectedItemIndex: number | null,
  onPanMove?: (dx: number, dy: number) => void,
  onPanRelease?: (dx: number, dy: number) => void
) => {
  const { settings } = useHesokuriStore();
  
  // ▼ 修正復元: boolean ではなく、表示すべきエフェクトのIDを string で管理し、複数種類のエフェクト出し分けに対応
  const [activeEffects, setActiveEffects] = useState<Record<string, string>>({});
  const prevExpsRef = useRef<Record<string, number>>({});
  const prevLevelsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!settings) return;

    const currentExps: Record<string, number> = { ...(settings.itemExps || {}) };
    const currentLevels: Record<string, number> = { ...(settings.itemLevels || {}) };
    
    // 後方互換の取り込み
    if (settings.plantExp !== undefined) currentExps['PL-01'] = settings.plantExp;
    if (settings.plantLevel !== undefined) currentLevels['PL-01'] = settings.plantLevel;

    let hasChanges = false;
    const newEffects = { ...activeEffects };

    placements.forEach(p => {
      if (!p.itemId.startsWith('PL-')) return;
      const itemId = p.itemId;
      
      const cExp = currentExps[itemId] || 0;
      // 初回マウント時はエフェクトを出さないよう、prevが無ければ現在の値を入れる
      const pExp = prevExpsRef.current[itemId] ?? cExp; 
      
      const cLevel = currentLevels[itemId] || 1;
      const pLevel = prevLevelsRef.current[itemId] ?? cLevel;

      // ▼ 修正復元: レベルアップ時と水やり（経験値増加）時でエフェクトIDを出し分ける
      if (cLevel > pLevel) {
        // レベルアップ時は専用エフェクト（EF-04）を指定
        newEffects[itemId] = 'EF-04';
        hasChanges = true;
      } else if (cExp > pExp) {
        // 通常の経験値増加時はマスターデータに設定されたエフェクト（EF-01やEF-02）を指定
        const treeMaster = ALL_GARDEN_ITEMS.find(item => item.id === itemId);
        newEffects[itemId] = treeMaster?.growthEffectId || 'EF-01';
        hasChanges = true;
      }

      prevExpsRef.current[itemId] = cExp;
      prevLevelsRef.current[itemId] = cLevel;
    });

    if (hasChanges) {
      setActiveEffects(newEffects);
    }
  }, [settings?.itemExps, settings?.itemLevels, settings?.plantExp, settings?.plantLevel, placements]);

  const clearActiveEffect = useCallback((itemId: string) => {
    setActiveEffects(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => selectedItemIndex === null && (Math.abs(gs.dx) > 10 || Math.abs(gs.dy) > 10),
      onPanResponderMove: (_, gs) => { if (selectedItemIndex === null && onPanMove) onPanMove(gs.dx, gs.dy); },
      onPanResponderRelease: (_, gs) => { if (selectedItemIndex === null && onPanRelease) onPanRelease(gs.dx, gs.dy); }
    })
  ).current;

  const renderNodes = useMemo(() => {
    const nodes: RenderNode[] = [];
    for (let x = 0; x < GARDEN_CONFIG.GRID_SIZE; x++) {
      for (let y = 0; y < GARDEN_CONFIG.GRID_SIZE; y++) nodes.push({ id: `floor-${x}-${y}`, type: 'floor', x, y, zIndex: getZIndexScore(x, y, 'floor') });
    }
    placements.forEach((p, index) => {
      if (p.itemId.startsWith('BG-') || p.itemId.startsWith('WP-')) return;
      const isLargeItem = p.itemId.startsWith('PL-');
      nodes.push({ id: `item-${p.itemId}-${index}`, type: isLargeItem ? 'large_item' : 'item', x: p.x, y: p.y, zIndex: getZIndexScore(p.x, p.y, isLargeItem ? 'large_item' : 'item'), placementData: p, originalIndex: index });
    });
    return nodes.sort((a, b) => a.zIndex - b.zIndex);
  }, [placements]);

  return { activeEffects, clearActiveEffect, panResponder, renderNodes };
};