# 01-C_プロジェクトファイル定義書(frontend_components)

## 1. フロントエンド コンポーネント・スタイル層 (hesokuri-cho/)
React Native / Expo を用いたモバイルアプリのUIコンポーネント群およびモック・スタイル定義。
**【コーディング時の絶対原則】既存コードのインデントや空行に含まれるスペースは標準の半角スペース（U+0020）で構成し、勝手なフォーマット改変や U+00A0（ノーブレークスペース）等の特殊文字の混入を絶対に起こさないこと。**

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

#### サブスクリプション (subscription/)
| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| SubscriptionPaywallModal.tsx | サブスクリプション（プレミアムプラン）への登録を促すペイウォール画面（モーダル）。課金機能への導線を担うコンポーネント。 |

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
| AdvancedSettingsSection.tsx | 詳細設定セクション（ログアウト処理、テーマ切り替え、デバッグパネルの読み込みを含む）のUIコンポーネント。**【重要】退会処理（deleteAccount）の実行前警告Alertおよび管理者専用デバッグパネルの読み込み制御を担う。** |
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