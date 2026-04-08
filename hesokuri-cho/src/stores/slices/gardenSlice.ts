// src/stores/slices/gardenSlice.ts
import { StateCreator } from 'zustand';
import { HesokuriState } from '../../store';
import { GARDEN_CONSTANTS } from '../../constants';
import { GLOBAL_GARDEN_SETTINGS, SPRITE_CONFIG } from '../../config/spriteConfig';

export const createGardenSlice: StateCreator<HesokuriState, [], [], any> = (set, get) => ({
  selectedTreeId: null,
  setSelectedTreeId: (id) => set({ selectedTreeId: id }),
  
  waterGarden: async () => {
    const state = get(); 
    if (!state.settings) return; 
    const todayStr = new Date().toISOString().slice(0, 10);
    if (state.settings.lastWateringDate === todayStr) return;
    
    await state.updateSettings({ 
      ...state.settings, 
      gardenPoints: (state.settings.gardenPoints || 0) + 20, 
      lastWateringDate: todayStr 
    });
  },

  updateGardenPlacements: async (placements) => {
    const state = get(); 
    if (!state.settings) return;
    
    const counts: Record<string, number> = {};
    const valid = placements.filter(p => {
      counts[p.itemId] = (counts[p.itemId] || 0) + 1;
      return counts[p.itemId] <= (SPRITE_CONFIG[p.itemId]?.maxQuantity ?? 99);
    });
    
    const newSettings = { ...state.settings, gardenPlacements: valid };
    set({ settings: newSettings }); 
    await state.updateSettings(newSettings);
  },

  levelUpTree: async (targetItemId?: string, effectId?: string) => {
    const state = get(); 
    if (!state.settings) return;
    const itemId = targetItemId || state.selectedTreeId || 'PL-01';
    const currentLevel = state.settings.itemLevels?.[itemId] || 1;
    const currentExp = state.settings.itemExps?.[itemId] || 0;
    
    if (currentLevel >= GLOBAL_GARDEN_SETTINGS.MAX_PLANT_LEVEL) return;
    
    const cost = GARDEN_CONSTANTS.LEVEL_UP_COSTS[currentLevel];
    const points = state.settings.gardenPoints || 0;
    const consumePoints = Math.min(GLOBAL_GARDEN_SETTINGS.LEVEL_UP_UNIT_COST, points, cost - currentExp);
    
    if (consumePoints <= 0) return;

    let newLevel = currentLevel; 
    let newExp = currentExp + consumePoints;
    
    if (newExp >= cost) { 
      newLevel = currentLevel + 1; 
      newExp = 0; 
    }

    const newSettings = { 
      ...state.settings, 
      itemLevels: { ...(state.settings.itemLevels || {}), [itemId]: newLevel }, 
      itemExps: { ...(state.settings.itemExps || {}), [itemId]: newExp },
      gardenPoints: points - consumePoints, 
      lastWateringDate: new Date().toISOString()
    };
    
    if (itemId === 'PL-01') { 
      newSettings.plantLevel = newLevel; 
      newSettings.plantExp = newExp; 
    }
    
    set({ settings: newSettings }); 
    await state.updateSettings(newSettings);
  },

  setDebugPlantLevel: async (level) => {
    const state = get(); 
    if (!state.settings) return;
    const newSettings = { 
      ...state.settings, 
      plantLevel: level, 
      plantExp: 0, 
      itemLevels: { 'PL-01': level }, 
      itemExps: { 'PL-01': 0 } 
    };
    set({ settings: newSettings }); 
    await state.updateSettings(newSettings);
  }
});