// src/components/dashboard/DashboardAdBanner.tsx
import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// TODO: 【リリース必須】本番用のバナー広告ユニットIDに確実に差し替えること
const adUnitId = __DEV__ ? TestIds.BANNER : TestIds.BANNER;

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