// src/hooks/useGardenCamera.ts
import { useState, useEffect, useCallback } from 'react';
import { useHesokuriStore } from '../store';
import { GLOBAL_GARDEN_SETTINGS } from '../config/spriteConfig';

export const useGardenCamera = () => {
  const { settings, updateSettings } = useHesokuriStore();
  
  const [baseOffset, setBaseOffset] = useState<{x: number, y: number}>(settings?.gardenMapOffset || { x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  const currentViewOffset = {
    x: baseOffset.x + panOffset.x,
    y: baseOffset.y + panOffset.y,
  };

  const handlePanMove = useCallback((dx: number, dy: number) => {
    setPanOffset({ 
      x: dx * GLOBAL_GARDEN_SETTINGS.panSensitivity, 
      y: dy * GLOBAL_GARDEN_SETTINGS.panSensitivity 
    });
  }, []);

  const handlePanRelease = useCallback((dx: number, dy: number) => {
    // ▼ ワープバグの修正: prevを使って常に最新の座標を取得して加算する
    setBaseOffset(prev => {
      const newOffset = { 
        x: prev.x + (dx * GLOBAL_GARDEN_SETTINGS.panSensitivity), 
        y: prev.y + (dy * GLOBAL_GARDEN_SETTINGS.panSensitivity) 
      };
      return newOffset;
    });
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleResetMapPosition = useCallback(() => {
    setBaseOffset({ x: 0, y: 0 });
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // ベース位置が確定した時だけストアに保存して記憶させる
  useEffect(() => {
    updateSettings({ ...settings, gardenMapOffset: baseOffset });
  }, [baseOffset]);

  return {
    currentViewOffset,
    handlePanMove,
    handlePanRelease,
    handleResetMapPosition
  };
};