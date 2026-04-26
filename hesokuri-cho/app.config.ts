import { ExpoConfig, ConfigContext } from 'expo/config';

/*
 * 【重要：リリース時チェックリスト】
 * 1. AdMob の本番用 App ID を取得しているか
 * 2. 下記の androidAppId / iosAppId を本番用 ID に差し替えたか
 * 3. 各広告ユニット ID も本番用に差し替えているか
 */

const ADMOB_TEST_APP_ID_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_TEST_APP_ID_IOS = 'ca-app-pub-3940256099942544~1458002511';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "hesokuri-cho",
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
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png"
    },
    predictiveBackGestureEnabled: false
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
        // TODO: リリース時に本番用App IDへ差し替えること
        androidAppId: ADMOB_TEST_APP_ID_ANDROID,
        iosAppId: ADMOB_TEST_APP_ID_IOS
      }
    ]
  ]
});