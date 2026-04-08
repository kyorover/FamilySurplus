# 節約帖 DynamoDB テーブル仕様定義書

## 【前提：認証・ユーザー管理基盤について】
本システムにおけるユーザー認証（サインアップ、ログイン、パスワード管理）およびセッショントークン（JWT）の発行は、すべて **AWS Cognito (User Pool)** にて一元管理しています。
そのため、DynamoDB側にはパスワードやセキュリティに直結する認証クレデンシャルは保持しません。Cognitoから発行される一意のユーザー識別子（sub）を、各テーブルのパーティションキー（`householdId` または `accountId`）として利用することで、家族ごとのデータを安全に分離するマルチテナント・アーキテクチャを実現しています。

本システムはAWS CDK（`hesokuri-backend-stack.ts`）によって定義された **4つ** のDynamoDBテーブルで構成されています。すべてのテーブルは `PAY_PER_REQUEST`（オンデマンドキャパシティ）に設定され、スタック削除時のポリシーは `DESTROY` に設定されています。

---

## 1. HouseholdSettingsTable（世帯設定テーブル）

### 1.1. インフラ定義
- **テーブル名参照**: 環境変数 `SETTINGS_TABLE_NAME`
- **パーティションキー (PK)**: `householdId` (String型) ※Cognitoのsubと一致
- **ソートキー (SK)**: なし

### 1.2. データスキーマ（項目属性）
TypeScriptの `HouseholdSettings` インターフェースに基づき、以下の属性が保存されます。

- `householdId` (string): パーティションキー
- `familyMembers` (FamilyMember配列): 家族構成情報
  - 配列内の各オブジェクト構造: `id` (string), `name` (string), `role` ('大人' | '子供'), `age` (number / 任意), `hasPocketMoney` (boolean), `pocketMoneyAmount` (number)
- `categories` (Category配列): カテゴリ情報
  - 配列内の各オブジェクト構造: `id` (string), `name` (string), `budget` (number), `isFixed` (boolean), `isCalculationTarget` (boolean / 任意)
- `notificationsEnabled` (boolean): 通知設定
- `updatedAt` (Date | string): 最終更新日時。PUT API実行時にバックエンドで `new Date().toISOString()` がセットされる
- `storeNameHistory` (string配列 / 任意): フロントエンドからの送信時、新規の店舗名がある場合は既存の履歴の先頭に追加され、最大50件にスライスされて保存される
- `memoHistory` (string配列 / 任意): フロントエンドからの送信時、新規のメモがある場合は既存の履歴の先頭に追加され、最大50件にスライスされて保存される
- `gardenPoints` (number): 庭機能のポイント
- `lastWateringDate` (string | null): 最終水やり日時
- `ownedGardenItemIds` (string配列): 所有している庭アイテムのIDリスト
- `gardenPlacements` (GardenPlacement配列 / 任意): 永続化されるお庭の配置情報
- `plantLevel` (number / 任意): 知恵の木のレベル(1〜5)
- `plantExp` (number / 任意): 知恵の木に蓄積された経験値ポイント
- `itemLevels` (Record<string, number> / 任意): 木それぞれ(itemId)のレベル
- `itemExps` (Record<string, number> / 任意): 木それぞれ(itemId)の蓄積経験値
- `itemCounts` (Record<string, number> / 任意): アイテムごとの所持個数
- `selectedTreeId` (string / 任意): 選択中の木のID
- `selectedTileId` (string / 任意): 選択中のタイルのID

---

## 2. ExpenseRecordsTable（支出記録テーブル）

### 2.1. インフラ定義
- **テーブル名参照**: 環境変数 `EXPENSES_TABLE_NAME`
- **パーティションキー (PK)**: `householdId` (String型) ※Cognitoのsubと一致
- **ソートキー (SK)**: `date_id` (String型)

### 2.2. データスキーマ（項目属性）
- `id` (string): UUID等のユニークID
- `householdId` (string): パーティションキー
- `date` (string): 支出発生日 (YYYY-MM-DD形式)
- `categoryId` (string): カテゴリID
- `amount` (number): 支出金額
- `paymentMethod` (string): 支払い方法
- `storeName` (string / 任意): 店舗名・購入先
- `memo` (string / 任意): メモ。入力値に対してフロントエンドで `.trim()` が実行された値
- `date_id` (string): ソートキー (YYYY-MM-DD#UUID の形式などを想定)
- `createdAt` (string / 任意): POST API実行時にバックエンドで `new Date().toISOString()` がセットされる

### 2.3. アクセスパターンとAPI仕様
- **新規作成 (POST /expenses)**
  - `PutCommand` を使用。
  - バリデーション: `householdId`, `date`, `amount` が必須。
  - 保存時に `id` (UUID), `date_id`, `createdAt` をサーバー側で生成し付与する。
- **月次一覧取得 (GET /expenses/{householdId}?month={monthPrefix})**
  - `QueryCommand` を使用。
  - 検索条件: `householdId = :hid AND begins_with(date_id, :month)`。ソートキー `date_id` に対する前方一致検索を行う。
- **更新 (PUT /expenses)**
  - `PutCommand` を使用。
  - バリデーション: `householdId` と `date_id` が必須。
- **削除 (DELETE /expenses/{householdId}?date_id={date_id})**
  - `DeleteCommand` を使用。
  - 削除対象の特定に `householdId` と `date_id` を使用する。

---

## 3. MonthlyBudgetsTable（月次予算テーブル）

### 3.1. インフラ定義
- **テーブル名参照**: 環境変数 `MONTHLY_BUDGETS_TABLE_NAME`
- **パーティションキー (PK)**: `householdId` (String型) ※Cognitoのsubと一致
- **ソートキー (SK)**: `month_id` (String型)

### 3.2. データスキーマ（項目属性）
TypeScriptの `MonthlyBudget` インターフェースに基づき、以下の属性が保存されます。

- `householdId` (string): パーティションキー
- `month_id` (string): ソートキー (YYYY-MM形式)
- `budgets` (Record<string, number>): カテゴリごとの予算金額マップ
- `bonusAllocation` (Record<string, number>): ボーナスの配分先マップ
- `deficitRule` ('みんなで折半' | '配分比率でカバー' | 'お小遣いは減らさない'): 赤字時のルール
- `updatedAt` (string): 最終更新日時

---

## 4. AccountsTable（アカウント・課金情報テーブル）【新規追加】

### 4.1. インフラ定義
- **テーブル名参照**: 環境変数 `ACCOUNTS_TABLE_NAME`
- **パーティションキー (PK)**: `accountId` (String型)
- **ソートキー (SK)**: なし

### 4.2. データスキーマ（項目属性）
TypeScriptの `AccountInfo` インターフェースに基づき、アカウント固有のビジネスロジックや拡張性（マネタイズ等）を管理するための属性が保存されます。

- `accountId` (string): パーティションキー。Cognitoから発行される一意のユーザーID（sub）と完全に一致させる。他テーブルの `householdId` と同義。
- `email` (string): 登録されたメールアドレス
- `subscriptionPlan` ('FREE' | 'PREMIUM'): 現在の契約プランステータス。将来的な広告非表示や機能制限の制御に使用される。
- `isAdmin` (boolean): お庭デバッグ機能の使用可否を判定するフラグ値。管理者のみ扱える想定。
- `createdAt` (string): アカウント（レコード）作成日時。ISO 8601形式で記録される。

### 4.3. アクセスパターンとトリガー仕様
- **新規作成（Cognito Post Confirmation トリガーによる自動作成）**
  - ユーザーがフロントエンドから新規登録（サインアップ）を行い、メールの確認コードによる検証を完了した直後に、Cognitoの「Post Confirmation（確認後のトリガー）」機能によってバックエンドの専用Lambda関数が非同期で発火する。
  - このLambda関数が、DynamoDBの `AccountsTable` に対して初期レコード（`subscriptionPlan: 'FREE'` 等）の `PutCommand` を実行し、データを自動作成する。
  - フロントエンドからのAPI呼び出しに依存しないため、ネットワークエラー等による「Cognitoには登録されたがDBにはデータがない」という不整合を完全に防止し、確実なデータ同期を担保する。