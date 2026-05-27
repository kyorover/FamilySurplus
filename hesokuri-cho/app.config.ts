import { ExpoConfig, ConfigContext } from 'expo/config';

/*
 * 【重要：リリース時チェックリスト】
 * 1. AdMob の本番用 App ID を取得しているか
 * 2. 下記の androidAppId / iosAppId を本番用 ID に差し替えたか
 * 3. 各広告ユニット ID も本番用に差し替えているか
 */

const ADMOB_TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';
// 今回取得した本番用App ID
const ADMOB_PROD_APP_ID = 'ca-app-pub-9263017157860225~7118508505';

// ビルド環境の判定（デフォルトは dev）
const APP_ENV = process.env.APP_ENV || 'dev';

// 環境ごとのAPIエンドポイント（後ほどCDKデプロイ時に出力されたURLを設定してください）
const API_URLS = {
  dev: 'https://78rv6h4q6i.execute-api.ap-northeast-1.amazonaws.com/dev/',
  prod: 'https://ducgzystqh.execute-api.ap-northeast-1.amazonaws.com/prod/',
};

// 環境ごとのCognito設定
const COGNITO_CONFIGS = {
  dev: {
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_sT3RqDVAW',
    webClientId: '676lk1m0iuteokke9ef5ghjk08'
  },
  prod: {
    region: 'ap-northeast-1',
    userPoolId: 'ap-northeast-1_4t8IC7CsS',
    webClientId: '5prssoltpblp7kcntc25o00f27'
  }
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_ENV === 'dev' ? "hesokuri-cho (Dev)" : "hesokuri-cho",
  slug: "hesokuri-cho",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tlitt.hesokuricho",
    // ストア申請のたびにインクリメント（1, 2, 3...）が必要
    buildNumber: "1"
  },
  android: {
    package: "com.tlitt.hesokuricho",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png"
    },
    predictiveBackGestureEnabled: false,
    // ストア申請のたびにインクリメント（1, 2, 3...）が必要
    versionCode: 1
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  plugins: [
    "expo-secure-store",
    [
      "expo-tracking-transparency",
      {
        "userTrackingPermission": "お客様の興味関心に合わせた最適な広告を表示するために使用します。"
      }
    ],
    [
      "react-native-google-mobile-ads",
      {
        // APP_ENVが'prod'の時は本番ID、それ以外はテスト用IDを自動適用
        androidAppId: APP_ENV === 'prod' ? ADMOB_PROD_APP_ID : ADMOB_TEST_APP_ID_ANDROID,
        iosAppId: APP_ENV === 'prod' ? ADMOB_PROD_APP_ID : ADMOB_TEST_APP_ID_IOS
      }
    ]
  ],
  // アプリ内から Constants.expoConfig.extra で参照可能にする設定
  extra: {
    apiUrl: API_URLS[APP_ENV as keyof typeof API_URLS],
    cognito: COGNITO_CONFIGS[APP_ENV as keyof typeof COGNITO_CONFIGS],
    variant: APP_ENV,
    revenueCatApiKeyAndroid: process.env.REVENUECAT_API_KEY_ANDROID || '',
    revenueCatApiKeyIos: process.env.REVENUECAT_API_KEY_IOS || '',
  }
});