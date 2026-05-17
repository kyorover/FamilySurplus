// src/components/dashboard/DashboardAdBanner.tsx
import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// 本番用バナー広告ユニットID
const ADMOB_PROD_BANNER_ID = 'ca-app-pub-9263017157860225/1428409571';

// 開発環境ではテスト用ID、本番環境では本番用IDを使用する
const adUnitId = __DEV__ ? TestIds.BANNER : ADMOB_PROD_BANNER_ID;

interface DashboardAdBannerProps {
  isFreePlan: boolean;
}

export const DashboardAdBanner: React.FC<DashboardAdBannerProps> = ({ isFreePlan }) => {
  // 課金ユーザーの場合は何も表示しない
  if (!isFreePlan) return null;

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