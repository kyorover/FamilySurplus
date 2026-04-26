# 01-C_プロジェクトファイル定義書(frontend)

## 1. フロントエンド (hesokuri-cho/)
React Native / Expo を用いたモバイルアプリ。収入を扱わず「支出管理とへそくり算出」に特化。
**【コーディング時の絶対原則】既存コードのインデントや空行に含まれるスペースは標準の半角スペース（U+0020）で構成し、勝手なフォーマット改変や U+00A0（ノーブレークスペース）等の特殊文字の混入を絶対に起こさないこと。**

### 1-1. エントリ・設定・グローバル定義

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| App.tsx / index.ts | アプリのエントリポイント。ナビゲーションのセットアップやグローバルプロバイダのラッパーとして機能。**【重要】react-navigation等の外部ライブラリは未導入。Stateベースの独自タブ遷移を監視している。また、起動時の初期データ一括フェッチ（fetchAccountInfo, fetchNationalStatistics等）と、ATT許諾要求（useTrackingPermission）の呼び出しが既に実装・マウント済みである。** |
| app.config.ts | Expoの動的設定ファイル。`app.json`から移行。AdMobのApp ID設定や、環境変数によるビルド構成の制御、リリース時のTODO警告などを内包する。 |
| babel.config.js | Babelの構成ファイル。環境変数 `MOCK_ADMOB` に基づき、Expo Go環境でのみ `react-native-google-mobile-ads` を `src/mocks/AdMobMock.tsx` に置換するルーティングを定義。 |
| package.json / tsconfig.json | Node.js/TypeScriptの構成。**【重要】Expo SDKおよびAdMob関連パッケージ、Babelモック用プラグインが定義されている。** |
| src/types.ts | 【最重要】フロント・バック共通の唯一のスキーマソース。DBスキーマやコンポーネントのPropsはすべてここに依存する。勝手なフィールド（特にincome）の追加は厳禁. |
| src/store.ts | グローバル状態管理（Zustand等を想定）。予算、支出データ、庭の配置情報などを保持。**【重要】`settings`と`pendingSettings`の比較が遷移ガードの判定基準。** |
| src/stores/authStore.ts | 認証状態（ログインユーザー情報、セッショントークン等）を管理する独立したStore。 |
| src/stores/slices/expenseSlice.ts | 支出データのCRUD操作と、過去月データ編集時のへそくり履歴（サマリー）サイレント上書き更新処理を担うZustandスライス。 |
| src/stores/slices/gardenSlice.ts | 庭・ガーデン機能の状態（水やりによるポイント付与、アイテム配置の更新、レベルアップ処理など）を管理するZustandスライス。 |
| src/stores/slices/settingsSlice.ts | 家計設定、アカウント情報、公的統計データなどの取得・更新を管理するZustandスライス。固定カテゴリの同期（補完）機能も担う。 |
| src/constants.ts | アプリ全体の固定値、環境変数キーなどの定数。**【重要】利用規約・プライバシーポリシーの本番URL定数もここで一元管理されており、TermsAgreementUI等のリンク先はここから取得する。** |
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
| src/services/apiService.ts | バックエンド（API Gateway等）との通信を担う中核的なサービス層。共通の通信処理やエラーハンドリングをカプセル化。**【重要】内部の fetchWithAuth インターセプターにより、401エラーの捕捉と詳細なログ出力を一元管理している。アカウント削除用の deleteAccount メソッドもここに定義済み。** |
| src/services/cognitoAuthService.ts | AWS CognitoへのAPIリクエスト（サインアップ、ログイン、トークン更新、パスワードリセットなど）を純粋な非同期関数群として抽象化したサービス層。 |
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

### 1-3. 画面コンポーネント (src/screens/)
各ページのルートコンポーネント。ルーティングのターゲットとなる。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| src/screens/LoginScreen.tsx | 認証機能のエントリとなるログイン画面（サインアップフロー等を含む）。**【重要】サインアップフローにおける「利用規約・プライバシーポリシー同意トグル」の状態管理を担う（タスク1-4の改修対象）。** |
| src/screens/OnboardingScreen.tsx | 新規ユーザーの初期設定（家族構成、カテゴリ予算設定）を行うオンボーディング画面。 |
| src/screens/DashboardScreen.tsx | メイン画面。現在の予算消化状況、カレンダー、へそくりサマリを束ねる。**【重要】月締めモーダル（MonthCheckoutModal）の呼び出し元であり、初回マウント時の判定ロジックが多重表示バグの改修対象となる。** |
| src/screens/InputScreen.tsx | 支出入力専用画面。テンキー入力とカテゴリ選択のフローを管理。 |
| src/screens/SettingsScreen.tsx | 予算設定、カテゴリ管理（固定/カスタム）、家族メンバー管理を束ねる画面。**【重要】各コンポーネントの内部マージンの有無を考慮し、全要素が左右16pxのラインで揃うよう補完・整列させること。** |
| src/screens/GardenScreen.tsx | 庭・ガーデン機能の本画面（メイン画面）。IsometricGardenCanvasやTreeGrowthPanelを呼び出し、ズームや配置操作、干渉防止ブロッカーを統合して表示する。 |
| src/screens/HesokuriHistoryScreen.tsx | へそくりの獲得履歴、および庭アイテム購入等での消費履歴を表示する画面。 |

### 1-4. マイクロコンポーネント (src/components/)
単一責務を持たせた再利用可能なUI部品。原則として50〜150行に収まるように分割して実装される。

#### 認証 (auth/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| AuthInputForm.tsx | 認証画面用の入力フォーム（メールアドレス、パスワード等）とバリデーションUIを提供するコンポーネント。**【重要】TermsAgreementUIと連携し、同意トグルがオフの場合に「新規登録」ボタンを非活性にする等の制御を担う。** |
| TermsAgreementUI.tsx | サインアップ時等に利用規約・プライバシーポリシーへの同意を求めるチェックボックス等のUIコンポーネント。**【重要】リンク先のURLは constants.ts から動的に取得し、ハードコードを避けること。** |

#### ナビゲーション (navigation/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| BottomTabBar.tsx | 画面下部に配置される独自のタブナビゲーションUIコンポーネント。 |

#### ダッシュボード (dashboard/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| DashboardStatusCard.tsx | 現在の状況（予算残額など）をサマリとして表示するステータスカードUI。 |
| BudgetProgressBar.tsx | 予算の消化具合をプログレスバーで視覚化する純粋なUI。 |
| MonthCalendar.tsx | 月間カレンダー。日別の支出有無などをドット等で表示。 |
| AllCategoryCalendarModal.tsx | カレンダーの全カテゴリ詳細をモーダルで表示。 |
| CategoryDetailModal.tsx | 特定カテゴリの支出詳細を示すモーダル。 |
| CategoryListSection.tsx | ダッシュボード上でカテゴリごとのリスト表示を束ねるセクションUI。 |
| CategoryMonthlyRecordList.tsx | 特定カテゴリの月別記録リストを表示するコンポーネント。 |
| DailyExpenseList.tsx | 特定日の支出リストを表示。 |
| HesokuriSummaryCard.tsx | 現在の累計へそくり額と今月の予想額をカード型で表示。 |
| HesokuriPocketMoneyArea.tsx | 今月のお小遣い着地見込み（基本額＋今月の残高に基づく追加ボーナス）を表示するコンポーネント。 |
| HesokuriBudgetEvaluation.tsx | 予算設定の妥当性を評価・表示するコンポーネント。 |
| TotalHesokuriDisplay.tsx | ヘッダー等に総へそくり額をシンプルに表示。 |
| MonthlyBudgetEditModal.tsx | 当月の臨時予算変更などを行うモーダル。 |
| PocketMoneyRuleModal.tsx | お小遣い制・へそくり還元ルールの詳細を表示するモーダル。 |
| MonthCheckoutModal.tsx | 月締め（へそくり結果発表）のモーダル制御と算出を行う親コンポーネント。Soft Lock仕様（キャンセル・後日入力可能）に対応。**【重要】多重レンダリングバグ改修時の最重要ファイル。** |
| MonthCheckoutContent.tsx | 月締め確定モーダルのUI描画のみを担当する純粋な表示用子コンポーネント（コンポーネント分割・単一責務の原則遵守）。 |
| DashboardSettingsMenu.tsx | ダッシュボード画面の設定メニューモーダルを独立させた単一責務コンポーネント。低頻度アクションのトリガーを提供する。 |
| DashboardAdBanner.tsx | バナー広告表示用のマイクロコンポーネント。課金プランを判定し、無課金ユーザーの場合のみ広告（本物または検証用モック）を表示する責務を担う。 |

#### 予算 (budget/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| BudgetFrame.tsx | 予算の合計計算（対象外カテゴリの除外含む）と評価ロジックを統合し、評価カードとリスト表示を束ねるフレームコンポーネント。 |

#### 入力 (input/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| ExpenseInputPad.tsx | 独自のテンキー（数字入力）UI。 |
| AutocompleteInput.tsx | 支出のメモや店舗名のサジェスト機能付き入力欄。 |
| DatePickerModal.tsx | 支出日の変更用カレンダーモーダル。 |
| InputActions.tsx | 保存、キャンセル等のアクションボタン群。 |
| InputDisplayHeader.tsx | 入力中の金額や選択中カテゴリを大きく表示する領域。 |
| InputScreenHeader.tsx | 入力画面専用のヘッダー。 |

#### 設定 (settings/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| BudgetEditModal.tsx | 基本予算額を編集するモーダル。 |
| BudgetEvaluationCard.tsx | 予算設定の妥当性（統計データ等との比較）を評価・表示するUI。 |
| CategoryList.tsx | カテゴリ一覧。**【重要】内部に左右のマージンを持っていない。親側での補正が必要。** |
| CategoryAddModal.tsx | カスタム科目を追加するモーダル。 |
| CategoryBudgetList.tsx | カテゴリごとの個別予算枠をリスト表示・編集。 |
| FamilyMemberList.tsx | 家族メンバー（利用者）のリスト表示UI。ドラッグ＆ドロップによる並び替え機能をサポートする。**【重要】内部に `margin: 16` を自前で保持している。** |
| FamilyMemberAddModal.tsx | 家族メンバーを新規追加するモーダル。 |
| FamilyMemberEditModal.tsx | 家族メンバーの名前等を編集する独立したモーダル。リストコンポーネント内にModalを埋め込むと再レンダリングやアニメーション競合（Glitchバグ）を引き起こすため、必ず独立させて親画面の最上位レイヤーで状態管理とマウントを行うこと。 |
| PocketMoneySettings.tsx | お小遣い還元率などの設定UI。 |
| InputHistoryManagerModal.tsx | 過去の入力履歴の編集・削除管理。 |
| SettingsMenuCard.tsx | 設定画面の各メニュー項目（アイコン、タイトル、説明文等）を描画する再利用可能なカードUI。 |
| AdvancedSettingsSection.tsx | 詳細設定セクション（ログアウト処理やデバッグパネルの読み込みを含む）のUIコンポーネント。**【重要】退会処理（deleteAccount）の実行前警告Alertおよび管理者専用デバッグパネルの読み込み制御を担う。** |
| DebugControlPanel.tsx | タイムトラベル（月締めテスト）などの開発・デバッグ用操作を提供する管理者（isAdmin）専用のコントロールパネル。 |

#### 庭・ガーデン (garden/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| GardenHeader.tsx | 庭・ガーデン機能のヘッダー。タイトルとショップを開くボタン等のアクションを提供する純粋なUIコンポーネント。 |
| CanvasItemNode.tsx | キャンバス上で各アイテム・木を 1 つ描画するための単一責務コンポーネント。タイルの中心座標を基準として絶対配置し、エフェクトの座標ズレを防止する。 |
| IsometricGardenCanvas.tsx | 庭のベースとなるアイソメトリック（等角投影）キャンバス。壁紙レイヤーとスケーリング対象レイヤーを分離し、ズーム UI を内包する。純粋な描画のみに専念する単一責務コンポーネント。 |
| GardenBuilderScreen.tsx | 配置テスト用のデバッグ/ビルダ画面。ズームの接続と干渉防止を組み込む。 |
| GardenControllerOverlay.tsx | 庭画面上にオーバーレイするUI（ショップを開く、リセット等）。 |
| GardenInventoryTray.tsx | 所持している（配置可能な）アイテムのトレイ群。 |
| GardenInventoryItem.tsx | インベントリ内の単一アイテム（アイコン・所持数など）を描画するコンポーネント。 |
| InventoryTabs.tsx | インベントリにおけるカテゴリ別タブ（植物、オブジェクト等）の切り替えUI。 |
| GardenShopModal.tsx | へそくりを使ってアイテムを購入するショップ画面。 |
| GardenShopListItem.tsx | ショップのアイテムリスト1行分を描画するコンポーネント。 |
| GardenMapResetButton.tsx | 庭の配置を初期化するボタン。 |
| DraggableGardenItem.tsx | ドラッグ＆ドロップで配置・移動可能なアイテムのラッパーコンポーネント。 |
| InteractiveGardenItem.tsx | タップ等のインタラクション（アニメーションなど）を持つアイテム。 |
| GardenWisdomTreeItem.tsx | 庭のシンボルツリー専用コンポーネント（成長要素などを想定）。 |
| EffectSprite.tsx / PlantSprite.tsx / UniversalSprite.tsx | 各種スプライト（画像）の描画用コンポーネント。 |
| TreeGrowthPanel.tsx | 知恵の木のレベルやポイントを表示・成長させるパネル。 |
| GardenZoomUI.tsx | キャンバス上に配置する「＋/－」のズーム操作ボタンUI。 |
| GardenPlacementBlocker.tsx | アイテム配置モード中に画面全体を覆い、他のUIへの誤操作を物理的に遮断する半透明のオーバーレイUI。 |

#### 履歴 (history/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| HesokuriHistoryList.tsx | 獲得および消費したへそくりの履歴をリスト表示するコンポーネント。 |
| HesokuriHistoryYearSelector.tsx | 履歴画面にて、表示対象の「年」を切り替えるセレクターUI。 |

### 1-5. 開発・検証用モック (src/mocks/)

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| AdMobMock.tsx | Expo Go環境でのクラッシュを避けるためのAdMobモック。本物のSDKと同一のインターフェースを提供し、検証用のプレースホルダーを描画する。 |

### 1-6. スタイル定義 (src/styles/)
画面コンポーネントから分離されたスタイル定義。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| src/styles/DashboardStyles.ts | DashboardScreenから分離されたスタイル（StyleSheet）定義ファイル。ビューコンポーネントからデザインの責務を切り離すために使用する。 |