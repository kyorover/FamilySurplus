// src/hooks/useTrackingPermission.ts
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * iOS14以降必須のATT(App Tracking Transparency)許諾ダイアログを表示するフック。
 * AppStateの監視に加え、UI描画完了を待つための遅延処理とデバッグログを含みます。
 */
export const useTrackingPermission = () => {
  const isRequested = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios' || isRequested.current) {
      return;
    }

    const requestPermission = async () => {
      try {
        // 1. まず現在のステータスを確認
        const current = await getTrackingPermissionsAsync();
        console.log(`[ATT] 現在のステータス: ${current.status}`);

        // 2. 未決定（undetermined）の場合のみダイアログを要求
        if (current.status === 'undetermined') {
          console.log('[ATT] ダイアログを表示します（1秒待機後）...');
          
          // UIの描画が完全に終わるのを待つため、1000ms遅延させる（不発バグ対策）
          setTimeout(async () => {
            const { status } = await requestTrackingPermissionsAsync();
            console.log(`[ATT] 選択後のステータス: ${status}`);
          }, 1000);
        } else {
          console.log(`[ATT] 既に決定済みのため、ダイアログは表示されません。`);
        }
        
        isRequested.current = true;
      } catch (error) {
        console.error('[ATT] エラーが発生しました:', error);
      }
    };

    if (AppState.currentState === 'active') {
      requestPermission();
    }

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !isRequested.current) {
        requestPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
};