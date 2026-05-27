// src/hooks/useAppStatus.ts
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { apiService } from '../services/apiService';

export type AppStatus = 'checking' | 'ok' | 'maintenance' | 'forceUpdate';

/**
 * 現在のアプリバージョンと要求される最小バージョンを比較する純粋関数
 * セマンティックバージョニング（例: 1.2.0 vs 1.10.0）に正しく対応します。
 * @returns 現在のバージョンが最小バージョンを下回っている（互換性がない）場合は true
 */
const isVersionObsolete = (current: string, min: string): boolean => {
  const currentParts = current.split('.').map(Number);
  const minParts = min.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, minParts.length); i++) {
    const c = currentParts[i] || 0;
    const m = minParts[i] || 0;
    if (c < m) return true;
    if (c > m) return false;
  }
  return false; // 等しい場合は古いとみなさない
};

/**
 * 起動時にバックエンドからシステムステータスをフェッチし、
 * バージョンの互換性やメンテナンス状態を判定するカスタムフック。
 */
export const useAppStatus = (): AppStatus => {
  const [status, setStatus] = useState<AppStatus>('checking');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiService.fetchSystemStatus();

        // 1. レスポンスが取得できない、またはパースに失敗した場合（バックエンドが古すぎる等）は
        // フェイルセーフとしてメンテナンス画面へ強制フォールバック
        if (!response) {
          console.warn('[SystemStatus] APIから有効なレスポンスが得られませんでした。');
          setStatus('maintenance');
          return;
        }

        const { isMaintenance, minAppVersion } = response;

        // 2. メンテナンス状態のチェック
        if (isMaintenance) {
          console.log('[SystemStatus] 現在メンテナンス中です。');
          setStatus('maintenance');
          return;
        }

        // 3. バージョン互換性のチェック
        // Constants.expoConfig?.version は app.config.ts に定義されたバージョン文字列
        const currentVersion = Constants.expoConfig?.version || '1.0.0';
        
        if (isVersionObsolete(currentVersion, minAppVersion)) {
          console.log(`[SystemStatus] バージョンが古すぎます。Current: ${currentVersion}, Min: ${minAppVersion}`);
          setStatus('forceUpdate');
          return;
        }

        // 4. 問題なし
        console.log('[SystemStatus] 正常に稼働しています。');
        setStatus('ok');

      } catch (error) {
        console.error('[SystemStatus] ステータス確認中に予期せぬエラーが発生しました:', error);
        setStatus('maintenance');
      }
    };

    checkStatus();
  }, []);

  return status;
};