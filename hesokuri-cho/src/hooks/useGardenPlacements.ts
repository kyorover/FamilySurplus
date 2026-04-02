// src/hooks/useGardenPlacements.ts
import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { GardenPlacement } from '../types';
import { useHesokuriStore } from '../store';
import { SPRITE_CONFIG } from '../config/spriteConfig';
import { GARDEN_CONFIG } from '../functions/gardenUtils';

export const useGardenPlacements = () => {
  const { settings, updateGardenPlacements } = useHesokuriStore();
  const [placements, setPlacements] = useState<GardenPlacement[]>([]);
  const [selectedPlacedItemIndex, setSelectedPlacedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (settings) setPlacements(settings.gardenPlacements || [{ itemId: 'PL-01', x: 2, y: 2 }]);
  }, [settings?.updatedAt]);

  const ownedItems = useMemo(() => {
    // ▼ BGやPL全種をマスターから動的に抽出して結合
    const allMasterKeys = Object.keys(SPRITE_CONFIG);
    const bgItems = allMasterKeys.filter(k => k.startsWith('BG-'));
    const plItems = allMasterKeys.filter(k => k.startsWith('PL-'));
    
    const rawItems = [...plItems, ...bgItems, ...(settings?.ownedGardenItemIds || [])];
    const uniqueItems = Array.from(new Set(rawItems));
    
    return uniqueItems.filter(itemId => SPRITE_CONFIG[itemId]).sort((a, b) => {
      if (a.startsWith('PL-') && !b.startsWith('PL-')) return -1;
      if (!a.startsWith('PL-') && b.startsWith('PL-')) return 1;
      return 0;
    });
  }, [settings?.ownedGardenItemIds]);

  const hasCollision = (currentPlacements: GardenPlacement[], targetIndex: number) => {
    const target = currentPlacements[targetIndex];
    const tSize = target.itemId.startsWith('PL-') ? 2 : 1; 
    return currentPlacements.some((p, i) => {
      if (i === targetIndex) return false;
      if (p.itemId.startsWith('BG-') || p.itemId.startsWith('WP-')) return false; // ▼ 衝突判定から背景と壁紙を除外
      const pSize = p.itemId.startsWith('PL-') ? 2 : 1;
      const overlapX = target.x < p.x + pSize && target.x + tSize > p.x;
      const overlapY = target.y < p.y + pSize && target.y + tSize > p.y;
      return overlapX && overlapY;
    });
  };

  const persistPlacements = (newPlacements: GardenPlacement[]) => updateGardenPlacements(newPlacements);

  const handleInventoryPress = (itemId: string) => {
    // 既に未確定アイテムがある場合は、マップを保存済み状態にリセットしてから処理する
    let currentPlacements = placements;
    if (selectedPlacedItemIndex !== null) {
      currentPlacements = settings?.gardenPlacements || [{ itemId: 'PL-01', x: 2, y: 2 }];
      setPlacements(currentPlacements);
      setSelectedPlacedItemIndex(null);
    }

    // ▼ 壁紙(WP)の場合は即時置換・保存して終了（移動・配置モードに入れない）
    if (itemId.startsWith('WP-') || itemId === 'WP-NONE') {
      const updated = currentPlacements.filter(p => !p.itemId.startsWith('WP-'));
      if (itemId !== 'WP-NONE') {
        updated.push({ itemId, x: 0, y: 0, isFlipped: false });
      }
      setPlacements(updated);
      persistPlacements(updated);
      return;
    }

    // ▼ 背景(BG)の場合は即時置換・保存して終了（移動させない）
    if (itemId.startsWith('BG-')) {
      const existingIndex = currentPlacements.findIndex(p => p.itemId.startsWith('BG-'));
      if (existingIndex !== -1) {
        const updated = [...currentPlacements];
        updated[existingIndex] = { ...updated[existingIndex], itemId };
        setPlacements(updated);
        persistPlacements(updated);
      } else {
        const updated = [...currentPlacements, { itemId, x: 0, y: 0, isFlipped: false }];
        setPlacements(updated);
        persistPlacements(updated);
      }
      return;
    }

    // ▼ 木(PL)の場合は置換して移動パネル（選択状態）を出す
    if (itemId.startsWith('PL-')) {
      const existingIndex = currentPlacements.findIndex(p => p.itemId.startsWith('PL-'));
      if (existingIndex !== -1) {
        const updated = [...currentPlacements];
        // 種類だけ置き換えて座標は維持
        updated[existingIndex] = { ...updated[existingIndex], itemId };
        setPlacements(updated);
        setSelectedPlacedItemIndex(existingIndex); // 選択状態にする
      } else {
        const spawnX = Math.max(0, GARDEN_CONFIG.GRID_SIZE - 2);
        const spawnY = Math.max(0, GARDEN_CONFIG.GRID_SIZE - 2);
        const updated = [...currentPlacements, { itemId, x: spawnX, y: spawnY, isFlipped: false }];
        setPlacements(updated);
        setSelectedPlacedItemIndex(updated.length - 1);
      }
      return;
    }

    // ▼ その他アイテムの場合
    const existingIndex = currentPlacements.findIndex(p => p.itemId === itemId);
    if (existingIndex !== -1) {
      setSelectedPlacedItemIndex(existingIndex);
    } else {
      const spawnX = Math.max(0, GARDEN_CONFIG.GRID_SIZE - 1);
      const spawnY = Math.max(0, GARDEN_CONFIG.GRID_SIZE - 1);
      setPlacements([...currentPlacements, { itemId, x: spawnX, y: spawnY, isFlipped: false }]);
      setSelectedPlacedItemIndex(currentPlacements.length); // 末尾に追加されるため
    }
  };

  const handlePressTile = (x: number, y: number) => {
    if (selectedPlacedItemIndex !== null) {
      if (settings) setPlacements(settings.gardenPlacements || [{ itemId: 'PL-01', x: 2, y: 2 }]);
      setSelectedPlacedItemIndex(null);
      return;
    }
    const clickedItemIndex = placements.findIndex(p => {
      if (p.itemId.startsWith('BG-') || p.itemId.startsWith('WP-')) return false; // ▼ 背景・壁紙はタップ判定対象外
      const pSize = p.itemId.startsWith('PL-') ? 2 : 1;
      return x >= p.x && x < p.x + pSize && y >= p.y && y < p.y + pSize;
    });
    if (clickedItemIndex !== -1) setSelectedPlacedItemIndex(clickedItemIndex);
  };

  const handleMovePlacedItem = (dx: number, dy: number) => {
    if (selectedPlacedItemIndex === null) return;
    const target = placements[selectedPlacedItemIndex];
    const size = target.itemId.startsWith('PL-') ? 2 : 1;
    const newX = target.x + dx;
    const newY = target.y + dy;
    if (newX < 0 || newX + size > GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY + size > GARDEN_CONFIG.GRID_SIZE) return;
    setPlacements(prev => {
      const updated = [...prev]; updated[selectedPlacedItemIndex] = { ...target, x: newX, y: newY }; return updated;
    });
  };

  const handleToggleMirror = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => {
      const updated = [...prev]; const target = updated[selectedPlacedItemIndex];
      updated[selectedPlacedItemIndex] = { ...target, isFlipped: !target.isFlipped }; return updated;
    });
  };

  const handleConfirmPlacement = () => {
    if (selectedPlacedItemIndex === null) return;
    if (hasCollision(placements, selectedPlacedItemIndex)) { Alert.alert('配置エラー', '他のアイテムと重なっています。'); return; }
    persistPlacements(placements); setSelectedPlacedItemIndex(null);
  };

  const handleRemovePlacedItem = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => { const updated = prev.filter((_, i) => i !== selectedPlacedItemIndex); persistPlacements(updated); return updated; });
    setSelectedPlacedItemIndex(null);
  };

  return {
    placements, selectedPlacedItemIndex, selectedTargetItem: selectedPlacedItemIndex !== null ? placements[selectedPlacedItemIndex] : null,
    ownedItems, isLoaded: !!settings, handleInventoryPress, handlePressTile, handleMovePlacedItem, handleToggleMirror, handleConfirmPlacement, handleRemovePlacedItem
  };
};