# 01-C_プロジェクトファイル定義書(frontend_core)

## 1. フロントエンド コア・ロジック層 (hesokuri-cho/)
React Native / Expo を用いたモバイルアプリ。収入を扱わず「支出管理とへそくり算出」に特化。
**【コーディング時の絶対原則】既存コードのインデントや空行に含まれるスペースは標準の半角スペース（U+0020）で構成し、勝手なフォーマット改変や U+00A0（ノーブレークスペース）等の特殊文字の混入を絶対に起こさないこと。**

### 1-1. エントリ・設定・グローバル定義

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| App.tsx / index.ts | アプリのエントリポイント。ナビゲーションのセットアップやグローバルプロバイダのラッパーとして機能。**【重要】起動直後に `useAppStatus` を用いてバックエンドとの互換性やメンテナンス状態を検証し、フェイルセーフ画面へのルーティングを最優先で行う。また、react-navigation等は未導入であり、Stateベースの独自タブ遷移、初期データ一括フェッチ、ATT許諾要求の呼び出しが既に実装済みである。** |
| app.config.ts | Expoの動的設定ファイル。`app.json`から移行。AdMobのApp ID設定や、環境変数によるビルド構成の制御、アプリのバージョン(`version`)定義、リリース時のTODO警告などを内包する。 |
| babel.config.js | Babelの構成ファイル。環境変数 `MOCK_ADMOB` に基づき、Expo Go環境でのみ `react-native-google-mobile-ads` を `src/mocks/AdMobMock.tsx` に置換するルーティングを定義。 |
| package.json / tsconfig.json | Node.js/TypeScriptの構成。**【重要】Expo SDKおよびAdMob関連パッケージ、Babelモック用プラグインが定義されている。** |
| src/types.ts | 【最重要】フロント・バック共通の唯一のスキーマソース。DBスキーマやコンポーネントのPropsはすべてここに依存する。勝手なフィールド（特にincome）の追加は厳禁. |
| src/store.ts | グローバル状態管理（Zustand等を想定）。予算、支出データ、庭の配置情報などを保持。**【重要】`settings`と`pendingSettings`の比較が遷移ガードの判定基準。** |
| src/stores/authStore.ts | 認証状態（ログインユーザー情報、セッショントークン等）を管理する独立したStore。 |
| src/stores/slices/expenseSlice.ts | 支出データのCRUD操作と、過去月データ編集時のへそくり履歴（サマリー）サイレント上書き更新処理を担うZustandスライス。 |
| src/stores/slices/gardenSlice.ts | 庭・ガーデン機能の状態（水やりによるポイント付与、アイテム配置の更新、レベルアップ処理など）を管理するZustandスライス。 |
| src/stores/slices/settingsSlice.ts | 家計設定、アカウント情報、公的統計データなどの取得・更新を管理するZustandスライス。固定カテゴリの同期（補完）機能も担う。 |
| src/constants.ts | アプリ全体の固定値、環境変数キーなどの定数。**【重要】利用規約・プライバシーポリシーの本番URL定数もここで一元管理されており、TermsAgreementUI等のリンク先はここから取得する。** |
| src/constants/colors.ts | ライトモード・ダークモードに対応したアプリ全体のカラーパレット（テーマカラー）を定義する定数ファイル。 |
| src/config/appConfig.ts | 予算関連の初期設定値・デフォルト設定（例：固定カテゴリの初期予算額）を一元管理する設定ファイル。 |
| src/config/spriteConfig.ts | スプライト（画像）のサイズ、アニメーションフレーム、ズームの制限値（MIN/MAX/STEP）などの描画設定。 |
| src/constants/gardenItems.ts | 庭に配置できるアイテムのマスターデータ（ID、名称、必要へそくり額、エフェクトIDなど）。 |

### 1-2. 純粋関数・フック・サービス (src/functions/, src/hooks/, src/services/)
UIに依存しないビジネスロジックと、Reactのライフサイクルに紐づくロジック。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| src/functions/budgetUtils.ts | 予算計算、余剰金（へそくり）の算出を行う純粋関数群。src/types.tsの型のみを使用し、外部副作用を持たせないこと。 |
| src/functions/categoryUtils.ts | カテゴリ（固定科目・カスタム科目）の判定、ソート、フィルタリングなどの処理を行う純粋関数群。 |
| src/functions/gardenUtils.ts | 庭の等角投影（アイソメトリック）座標変換、グリッド計算、衝突判定を行う純粋関数群。 |
| src/functions/authErrorHandler.ts | 認証系APIやプロセスで発生するエラーのハンドリングロジック。 |
| src/services/apiService.ts | バックエンド（API Gateway等）との通信を担う中核的なサービス層。共通の通信処理やエラーハンドリングをカプセル化。**【重要】未認証状態で叩ける `fetchSystemStatus` の追加に加え、内部の fetchWithAuth インターセプターによる401エラーの捕捉・ログ出力の一元管理、アカウント削除（deleteAccount）も定義済み。** |
| src/services/cognitoAuthService.ts | AWS CognitoへのAPIリクエスト（サインアップ、ログイン、トークン更新、パスワードリセットなど）を純粋な非同期関数群として抽象化したサービス層。 |
| src/hooks/useAppStatus.ts | 起動時にバックエンドからシステムステータスをフェッチし、セマンティックバージョニングによる互換性判定やメンテナンス状態のチェックを行うフェイルセーフ用カスタムフック。 |
| src/hooks/useExpenseSubmit.ts | 支出入力時のバリデーション、データ整形、Store/APIへの送信をカプセル化したカスタムフック。 |
| src/hooks/useMonthCheckout.ts | 複数月のスキップ処理、未運用（支出0件）月の判定、およびへそくり確定（Soft Lock方式）モーダルの状態管理とサイレント上書きロジックをカプセル化したフック。**【重要】DashboardScreenでの多重レンダリングや無限ループバグの温床になりやすいため、月跨ぎ判定のロジック修正時には副作用の連鎖に細心の注意を払うこと。** |
| src/hooks/useDashboardStats.ts | ダッシュボード画面における予算消化状況、カテゴリ別支出、現在のへそくり額などの統計計算ロジックをUIから分離するフック。 |
| src/hooks/useDashboardScreen.ts | DashboardScreenから分離された状態管理とUIロジック（モーダル開閉や月締め呼び出し等）をカプセル化したカスタムフック。 |
| src/hooks/useGardenCamera.ts | 庭画面のパン（スワイプ）移動量、およびズーム倍率のカメラ制御状態を管理するフック。ズーム倍率によるスワイプ座標の逆算補正を行い、操作のデグレを防ぐ責務を持つ。 |
| src/hooks/useGardenPlacements.ts | 庭上のアイテムの配置、移動、削除などの状態管理と永続化処理を繋ぐフック。 |
| src/hooks/useSettingsManager.ts | 設定画面（SettingsScreen）専用の状態管理フック。各モーダルの開閉状態、編集モードの切り替え、設定データの更新ロジックをカプセル化する。**【重要】ローカルの編集内容を即座にStoreの`pendingSettings`へ同期し、タブ遷移ガードを正常に機能させる責務を持つ。** |
| src/hooks/useGardenEngine.ts | 庭キャンバス（ IsometricGardenCanvas ）の内部状態とビジネスロジックをカプセル化したカスタムフック。パン操作（ PanResponder ）の制御、描画ノードの Z インデックスに基づくソート、エフェクトの出し分け判定を管理する。 |
| src/hooks/useOnboardingSubmit.ts | オンボーディング時の初期データ（家族構成、カテゴリ予算など）のバリデーションと、ストアへの初期設定永続化ロジックをカプセル化したカスタムフック。 |
| src/hooks/useFamilyActions.ts | 家族メンバーの追加、更新、削除（大人1名の最低制約など）のローカル状態操作（CRUD）をカプセル化したカスタムフック。 |
| src/hooks/useCategoryActions.ts | カテゴリ設定のローカル状態操作（CRUD）をカプセル化したカスタムフック。 |
| src/hooks/useTabNavigation.ts | 独自タブの遷移状態管理と、入力中・設定変更中の未保存データ破棄警告（遷移ガード処理）を行うカスタムフック。 |
| src/hooks/useTrackingPermission.ts | App Tracking Transparency (ATT) 等、トラッキング許可状態の取得およびリクエスト処理をカプセル化したフック。**【重要】UI描画完了を待つための遅延処理とAppState監視を含み既に堅牢に実装されているため、重複した新規実装の提案は絶対に避けること。** |
| src/hooks/useTheme.ts | Storeの明示的なテーマ設定（ライト/ダーク）を参照し、現在のテーマ状態と対応するカラーパレットをコンポーネントへ提供するカスタムフック。 |

### 1-3. 画面コンポーネント (src/screens/)
各ページのルートコンポーネント。ルーティングのターゲットとなる。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| src/screens/ForceUpdateScreen.tsx | 互換性のない古いバージョンのアプリを使用しているユーザーに対し、ストアへのアップデートを促す専用画面。 |
| src/screens/MaintenanceScreen.tsx | バックエンドのメンテナンス中、または予期せぬAPI障害発生時に、アプリの操作を物理的にブロックして待機を促す専用画面。 |
| src/screens/LoginScreen.tsx | 認証機能のエントリとなるログイン画面（サインアップフロー等を含む）。**【重要】サインアップフローにおける「利用規約・プライバシーポリシー同意トグル」の状態管理を担う（タスク1-4の改修対象）。** |
| src/screens/OnboardingScreen.tsx | 新規ユーザーの初期設定（家族構成、カテゴリ予算設定）を行うオンボーディング画面。 |
| src/screens/DashboardScreen.tsx | メイン画面。現在の予算消化状況、カレンダー、へそくりサマリを束ねる。**【重要】月締めモーダル（MonthCheckoutModal）の呼び出し元であり、初回マウント時の判定ロジックが多重表示バグの改修対象となる。** |
| src/screens/InputScreen.tsx | 支出入力専用画面。テンキー入力とカテゴリ選択のフローを管理。 |
| src/screens/SettingsScreen.tsx | 予算設定、カテゴリ管理（固定/カスタム）、家族メンバー管理を束ねる画面。**【重要】各コンポーネントの内部マージンの有無を考慮し、全要素が左右16pxのラインで揃うよう補完・整列させること。** |
| src/screens/GardenScreen.tsx | 庭・ガーデン機能の本画面（メイン画面）。IsometricGardenCanvasやTreeGrowthPanelを呼び出し、ズームや配置操作、干渉防止ブロッカーを統合して表示する。 |
| src/screens/HesokuriHistoryScreen.tsx | へそくりの獲得履歴、および庭アイテム購入等での消費履歴を表示する画面。 |