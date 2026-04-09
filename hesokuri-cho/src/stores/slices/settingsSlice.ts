// src/stores/slices/settingsSlice.ts
import { StateCreator } from 'zustand';
import { HesokuriState } from '../../store';
import { apiService } from '../../services/apiService';
import { syncFixedCategories } from '../../functions/categoryUtils';

export const createSettingsSlice: StateCreator<HesokuriState, [], [], any> = (set, get) => ({
  accountInfo: null, // ▼ 追加
  settings: null,
  pendingSettings: null,
  isLoading: false,
  error: null,
  
  setPendingSettings: (settings) => set({ pendingSettings: settings }),

  // ▼ 新規追加: アカウント情報を取得してストアに保存
  fetchAccountInfo: async () => {
    try {
      const accountInfo = await apiService.fetchAccountInfo();
      set({ accountInfo });
    } catch (e: any) {
      console.error('Failed to fetch account info:', e);
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try { 
      let settings = await apiService.fetchSettings();

      // 家族メンバーが未登録（0人）の場合は「初期設定未完了」とみなしブロック
      if (settings && (!settings.familyMembers || settings.familyMembers.length === 0)) {
        settings = null;
      }

      if (settings) {
        const syncedCategories = syncFixedCategories(settings);
        if (JSON.stringify(settings.categories) !== JSON.stringify(syncedCategories)) {
          settings.categories = syncedCategories;
          await apiService.updateSettings(settings); 
        }
      }
      set({ settings, isLoading: false }); 
    } 
    catch (e: any) { 
      if (e.message?.includes('404') || e.message?.includes('not found') || e.message?.includes('存在しません')) {
        set({ settings: null, isLoading: false });
      } else {
        set({ error: e.message, isLoading: false }); 
      }
    }
  },

  updateSettings: async (newSettings) => {
    const syncedSettings = { ...newSettings, categories: syncFixedCategories(newSettings) };
    set({ settings: syncedSettings, pendingSettings: null, isLoading: true, error: null });
    try { 
      await apiService.updateSettings(syncedSettings); 
      set({ isLoading: false }); 
    } 
    catch (e: any) { 
      set({ error: e.message, isLoading: false }); 
    }
  },
});