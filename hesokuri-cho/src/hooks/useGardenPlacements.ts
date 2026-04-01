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

  // 初回マウント時、または設定から配置データが読み込まれた時にローカルステートへ反映
  useEffect(() => {
    if (settings) {
      const savedPlacements = settings.gardenPlacements || [{ itemId: 'PL-01', x: 2, y: 2 }];
      setPlacements(savedPlacements);
    }
  }, [settings?.updatedAt]); // updatedAtが変わったら再同期

  const ownedItems = useMemo(() => {
    const rawItems = ['PL-01', ...(settings?.ownedGardenItemIds || [])];
    const uniqueItems = Array.from(new Set(rawItems));
    return uniqueItems
      .filter(itemId => SPRITE_CONFIG[itemId])
      .sort((a, b) => (a === 'PL-01' ? -1 : b === 'PL-01' ? 1 : 0));
  }, [settings?.ownedGardenItemIds]);

  const hasCollision = (currentPlacements: GardenPlacement[], targetIndex: number) => {
    const target = currentPlacements[targetIndex];
    const tSize = target.itemId === 'PL-01' ? 2 : 1;
    return currentPlacements.some((p, i) => {
      if (i === targetIndex) return false;
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      const overlapX = target.x < p.x + pSize && target.x + tSize > p.x;
      const overlapY = target.y < p.y + pSize && target.y + tSize > p.y;
      return overlapX && overlapY;
    });
  };

  const persistPlacements = (newPlacements: GardenPlacement[]) => {
    updateGardenPlacements(newPlacements);
  };

  const handleInventoryPress = (itemId: string) => {
    const existingIndex = placements.findIndex(p => p.itemId === itemId);
    if (existingIndex !== -1) {
      setSelectedPlacedItemIndex(existingIndex);
    } else {
      const size = itemId === 'PL-01' ? 2 : 1;
      const spawnX = GARDEN_CONFIG.GRID_SIZE - size;
      const spawnY = GARDEN_CONFIG.GRID_SIZE - size;
      setPlacements(prev => {
        const newPlacements = [...prev, { itemId, x: spawnX, y: spawnY }];
        setSelectedPlacedItemIndex(newPlacements.length - 1);
        return newPlacements;
      });
    }
  };

  const handlePressTile = (x: number, y: number) => {
    const clickedItemIndex = placements.findIndex(p => {
      const pSize = p.itemId === 'PL-01' ? 2 : 1;
      return x >= p.x && x < p.x + pSize && y >= p.y && y < p.y + pSize;
    });

    if (clickedItemIndex !== -1) {
      setSelectedPlacedItemIndex(clickedItemIndex);
    } else if (selectedPlacedItemIndex !== null) {
      if (hasCollision(placements, selectedPlacedItemIndex)) {
        Alert.alert('配置エラー', '現在のアイテムが他のアイテムと重なっています。');
      } else {
        persistPlacements(placements);
        setSelectedPlacedItemIndex(null);
      }
    }
  };

  const handleMovePlacedItem = (dx: number, dy: number) => {
    if (selectedPlacedItemIndex === null) return;
    const target = placements[selectedPlacedItemIndex];
    const size = target.itemId === 'PL-01' ? 2 : 1;
    const newX = target.x + dx;
    const newY = target.y + dy;

    if (newX < 0 || newX + size > GARDEN_CONFIG.GRID_SIZE || newY < 0 || newY + size > GARDEN_CONFIG.GRID_SIZE) return;

    setPlacements(prev => {
      const updated = [...prev];
      updated[selectedPlacedItemIndex] = { ...target, x: newX, y: newY };
      return updated;
    });
  };

  const handleConfirmPlacement = () => {
    if (selectedPlacedItemIndex === null) return;
    if (hasCollision(placements, selectedPlacedItemIndex)) {
      Alert.alert('配置エラー', '他のアイテムと重なっているため、確定できません。');
      return;
    }
    persistPlacements(placements);
    setSelectedPlacedItemIndex(null);
  };

  const handleRemovePlacedItem = () => {
    if (selectedPlacedItemIndex === null) return;
    setPlacements(prev => {
      const updated = prev.filter((_, i) => i !== selectedPlacedItemIndex);
      persistPlacements(updated);
      return updated;
    });
    setSelectedPlacedItemIndex(null);
  };

  return {
    placements,
    selectedPlacedItemIndex,
    selectedTargetItem: selectedPlacedItemIndex !== null ? placements[selectedPlacedItemIndex] : null,
    ownedItems,
    isLoaded: !!settings,
    handleInventoryPress,
    handlePressTile,
    handleMovePlacedItem,
    handleConfirmPlacement,
    handleRemovePlacedItem
  };
};