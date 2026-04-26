// src/mocks/AdMobMock.tsx
import React from 'react';
import { View, Text } from 'react-native';

// 本物のモジュールが提供する定数のダミー
export const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
};

export const TestIds = {
  BANNER: 'test-banner-id',
};

// 本物のモジュールが提供するコンポーネントのダミー（グレーのプレースホルダー枠）
export const BannerAd = (props: any) => {
  return (
    <View style={{
      width: 320,
      height: 50,
      backgroundColor: '#E0E0E0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#BDBDBD',
      marginVertical: 8
    }}>
      <Text style={{ color: '#757575', fontSize: 12 }}>
        [広告枠プレースホルダー（検証用）]
      </Text>
    </View>
  );
};