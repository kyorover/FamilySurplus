# 01-C_プロジェクトファイル定義書(frontend)

## 1. フロントエンド (hesokuri-cho/)
React Native / Expo を用いたモバイルアプリ。収入を扱わず「支出管理とへそくり算出」に特化。

### 1-1. エントリ・設定・グローバル定義

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| App.tsx / index.ts | アプリのエントリポイント。ナビゲーションのセットアップやグローバルプロバイダのラッパーとして機能。**【重要】react-navigation等の外部ライブラリは未導入。Stateベースの独自タブ遷移を監視している。** |
| app.json / package.json / tsconfig.json | Expoの設定およびNode.js/TypeScriptの構成。 |
| src/types.ts | 【最重要】フロント・バック共通の唯一のスキーマソース。DBスキーマやコンポーネントのPropsはすべてここに依存する。勝手なフィールド（特にincome）の追加は厳禁. |
| src/store.ts | グローバル状態管理（Zustand等を想定）。予算、支出データ、庭の配置情報などを保持。**【重要】`settings`と`pendingSettings`の比較が遷移ガードの判定基準。** |
| src/stores/authStore.ts | 認証状態（ログインユーザー情報、セッショントークン等）を管理する独立したStore。 |
| src/stores/slices/expenseSlice.ts | 支出データのCRUD操作と、過去月データ編集時のへそくり履歴（サマリー）サイレント上書き更新処理を担うZustandスライス。 |
| src/constants.ts | アプリ全体の固定値、環境変数キーなどの定数。 |
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
| src/services/apiService.ts | バックエンド（API Gateway等）との通信を担う中核的なサービス層。共通の通信処理やエラーハンドリングをカプセル化。 |
| src/hooks/useExpenseSubmit.ts | 支出入力時のバリデーション、データ整形、Store/APIへの送信をカプセル化したカスタムフック。 |
| src/hooks/useMonthCheckout.ts | 複数月のスキップ処理、未運用（支出0件）月の判定、およびへそくり確定（Soft Lock方式）モーダルの状態管理とサイレント上書きロジックをカプセル化したフック。 |
| src/hooks/useDashboardStats.ts | ダッシュボード画面における予算消化状況、カテゴリ別支出、現在のへそくり額などの統計計算ロジックをUIから分離するフック。 |
| src/hooks/useGardenCamera.ts | 庭画面のパン（スワイプ）移動量、およびズーム倍率のカメラ制御状態を管理するフック。ズーム倍率によるスワイプ座標の逆算補正を行い、操作のデグレを防ぐ責務を持つ。 |
| src/hooks/useGardenPlacements.ts | 庭上のアイテムの配置、移動、削除などの状態管理と永続化処理を繋ぐフック。 |
| src/hooks/useSettingsManager.ts | 設定画面（SettingsScreen）専用の状態管理フック。各モーダルの開閉状態、編集モードの切り替え、設定データの更新ロジックをカプセル化する。**【重要】ローカルの編集内容を即座にStoreの`pendingSettings`へ同期し、タブ遷移ガードを正常に機能させる責務を持つ。** |
| src/hooks/useGardenEngine.ts | 庭キャンバス（ IsometricGardenCanvas ）の内部状態とビジネスロジックをカプセル化したカスタムフック。パン操作（ PanResponder ）の制御、描画ノードの Z インデックスに基づくソート、およびレベルアップや水やりの複数種類のエフェクト出し分け判定を管理する。 |

### 1-3. 画面コンポーネント (src/screens/)
各ページのルートコンポーネント。ルーティングのターゲットとなる。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| src/screens/LoginScreen.tsx | 認証機能のエントリとなるログイン画面（サインアップフロー等を含む）。 |
| src/screens/OnboardingScreen.tsx | 新規ユーザーの初期設定（家族構成、カテゴリ予算設定）を行うオンボーディング画面。 |
| src/screens/DashboardScreen.tsx | メイン画面。現在の予算消化状況、カレンダー、へそくりサマリを束ねる。 |
| src/screens/InputScreen.tsx | 支出入力専用画面。テンキー入力とカテゴリ選択のフローを管理。 |
| src/screens/SettingsScreen.tsx | 予算設定、カテゴリ管理（固定/カスタム）、家族メンバー管理を束ねる画面。**【重要】各コンポーネントの内部マージンの有無を考慮し、全要素が左右16pxのラインで揃うよう補完・整列させること。** |
| src/screens/GardenScreen.tsx | 庭・ガーデン機能の本画面（メイン画面）。IsometricGardenCanvasやTreeGrowthPanelを呼び出し、ズームや配置操作、干渉防止ブロッカーを統合して表示する。 |
| src/screens/HesokuriHistoryScreen.tsx | へそくりの獲得履歴、および庭アイテム購入等での消費履歴を表示する画面。 |

### 1-4. マイクロコンポーネント (src/components/)
単一責務を持たせた再利用可能なUI部品。原則として50〜150行に収まるように分割して実装される。

#### 認証 (auth/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| AuthInputForm.tsx | 認証画面用の入力フォーム（メールアドレス、パスワード等）とバリデーションUIを提供するコンポーネント。 |

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
| MonthCheckoutModal.tsx | 月締め（へそくり結果発表）のモーダル制御と算出を行う親コンポーネント。Soft Lock仕様（キャンセル・後日入力可能）に対応。 |
| MonthCheckoutContent.tsx | 月締め確定モーダルのUI描画のみを担当する純粋な表示用子コンポーネント（コンポーネント分割・単一責務の原則遵守）。 |

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

