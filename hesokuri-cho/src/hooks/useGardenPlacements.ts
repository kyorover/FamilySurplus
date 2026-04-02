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

    // ▼ 背景(BG)や木(PL)の場合は即時置換・保存する
    if (itemId.startsWith('BG-') || itemId.startsWith('PL-')) {
      const prefix = itemId.substring(0, 3);
      const existingIndex = currentPlacements.findIndex(p => p.itemId.startsWith(prefix));
      
      if (existingIndex !== -1) {
        const updated = [...currentPlacements];
        updated[existingIndex] = { ...updated[existingIndex], itemId };
        setPlacements(updated);
        persistPlacements(updated);
      } else {
        const size = itemId.startsWith('PL-') ? 2 : 1;
        const spawnX = Math.max(0, GARDEN_CONFIG.GRID_SIZE - size);
        const spawnY = Math.max(0, GARDEN_CONFIG.GRID_SIZE - size);
        const updated = [...currentPlacements, { itemId, x: spawnX, y: spawnY, isFlipped: false }];
        setPlacements(updated);
        persistPlacements(updated);
      }
      return;
    }

    const existingIndex = currentPlacements.findIndex(p => p.itemId === itemId);
    if (existingIndex !== -1) setSelectedPlacedItemIndex(existingIndex);
    else {
      const size = itemId.startsWith('PL-') ? 2 : 1;
      const spawnX = Math.max(0, GARDEN_CONFIG.GRID_SIZE - size);
      const spawnY = Math.max(0, GARDEN_CONFIG.GRID_SIZE - size);
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