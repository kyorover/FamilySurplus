// src/hooks/useGardenCamera.ts
import { useState, useEffect, useCallback } from 'react';
import { useHesokuriStore } from '../store';
import { GLOBAL_GARDEN_SETTINGS } from '../config/spriteConfig';

export const useGardenCamera = () => {
  const { settings, updateSettings } = useHesokuriStore();
  
  const [baseOffset, setBaseOffset] = useState<{x: number, y: number}>(settings?.gardenMapOffset || { x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });
  
  // ▼ ズーム状態の管理
  const [zoomScale, setZoomScale] = useState<number>(GLOBAL_GARDEN_SETTINGS.DEFAULT_ZOOM_SCALE || 1.0);

  const currentViewOffset = {
    x: baseOffset.x + panOffset.x,
    y: baseOffset.y + panOffset.y,
  };

  const handlePanMove = useCallback((dx: number, dy: number) => {
    // スワイプ移動量をズームスケールで逆算し、操作感の過敏化を防ぐ
    setPanOffset({ 
      x: (dx * GLOBAL_GARDEN_SETTINGS.panSensitivity) / zoomScale, 
      y: (dy * GLOBAL_GARDEN_SETTINGS.panSensitivity) / zoomScale 
    });
  }, [zoomScale]);

  const handlePanRelease = useCallback((dx: number, dy: number) => {
    // ▼ ワープバグの修正: prevを使って常に最新の座標を取得して加算する
    setBaseOffset(prev => {
      const newOffset = { 
        x: prev.x + ((dx * GLOBAL_GARDEN_SETTINGS.panSensitivity) / zoomScale), 
        y: prev.y + ((dy * GLOBAL_GARDEN_SETTINGS.panSensitivity) / zoomScale) 
      };
      return newOffset;
    });
    setPanOffset({ x: 0, y: 0 });
  }, [zoomScale]);

  const handleResetMapPosition = useCallback(() => {
    setBaseOffset({ x: 0, y: 0 });
    setPanOffset({ x: 0, y: 0 });
    setZoomScale(GLOBAL_GARDEN_SETTINGS.DEFAULT_ZOOM_SCALE || 1.0);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomScale(prev => Math.min(prev + GLOBAL_GARDEN_SETTINGS.ZOOM_STEP, GLOBAL_GARDEN_SETTINGS.MAX_ZOOM_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomScale(prev => Math.max(prev - GLOBAL_GARDEN_SETTINGS.ZOOM_STEP, GLOBAL_GARDEN_SETTINGS.MIN_ZOOM_SCALE));
  }, []);

  useEffect(() => {
    updateSettings({ ...settings, gardenMapOffset: baseOffset });
  }, [baseOffset]);

  return {
    currentViewOffset, zoomScale,
    handlePanMove, handlePanRelease, handleResetMapPosition, handleZoomIn, handleZoomOut
  };
};