// src/components/dashboard/DashboardAdBanner.tsx
import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useHesokuriStore } from '../../store';

// 本番用バナー広告ユニットID
const ADMOB_PROD_BANNER_ID = 'ca-app-pub-9263017157860225/1428409571';

// 開発環境ではテスト用ID、本番環境では本番用IDを使用する
const adUnitId = __DEV__ ? TestIds.BANNER : ADMOB_PROD_BANNER_ID;

interface DashboardAdBannerProps {
  // 親からのProps渡し漏れによるバグを防ぐため、互換性用としてOptionalに残すが内部判定には使用しない
  isFreePlan?: boolean;
}

export const DashboardAdBanner: React.FC<DashboardAdBannerProps> = () => {
  // ▼ 修正: 親からのPropsに依存せず、ストアから直接アカウント情報を購読して自己判定する
  const { accountInfo } = useHesokuriStore();
  const isPremium = accountInfo?.subscriptionPlan === 'PREMIUM';

  // 課金ユーザーの場合は何も表示しない
  if (isPremium) return null;

  return (
    <View style={{ 
      alignItems: 'center', 
      width: '100%', 
      backgroundColor: 'transparent', 
      paddingBottom: Platform.OS === 'ios' ? 16 : 0 
    }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
};