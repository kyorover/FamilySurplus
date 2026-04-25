# 01-C_プロジェクトファイル定義書(backend)

## 1. バックエンド (hesokuri-backend/)
AWS CDKを用いたサーバーレスアーキテクチャ（TypeScript）。外部APIからのデータ取得やDynamoDBへの保存を担当。フロントエンドからの直接的な外部API呼び出しを避けるための層。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| bin/hesokuri-backend.ts | CDKアプリのエントリポイント。スタックのインスタンス化のみを行う。 |
| lib/hesokuri-backend-stack.ts | AWSリソース（API Gateway, Lambda, DynamoDB, EventBridge等）のインフラ定義（IaC）。**【重要】退会機能等でCognitoユーザーを操作する場合、Lambda関数に `AdminDeleteUser` 等のIAMポリシー権限付与と、環境変数（`USER_POOL_ID`等）の注入をここで行う必要がある。** |
| lib/constructs/database.ts | DynamoDBテーブル群の定義を切り出したConstruct。スタックの行数肥大化を防ぐ単一責務ファイル。 |
| lambda/index.ts | API Gatewayからの全リクエストを受け付け、認証ID(sub)を取得後、各ドメインのコントローラーへ処理を委譲するルーター。**【重要】コントローラーの引数（テーブル名や環境変数の追加など）を変更した場合は、必ずこのルーティング呼び出し部分も同期して修正すること。** |
| lambda/utils.ts | APIのCORSレスポンス生成や、DynamoDB保存時の空文字削除などを担当する共通純粋関数群。 |
| lambda/controllers/expenseController.ts | 支出データの登録・取得・更新・削除（CRUD）を担当するAPIコントローラー。 |
| lambda/controllers/settingsController.ts | アカウント情報、世帯設定、外部統計の取得・更新を担当。**【重要：退会処理（DELETE /account）の責務】DynamoDBの仕様上、ソートキーを持つテーブル（支出、予算、サマリー）のデータはパーティションキーのみでは削除不可（クラッシュする）。必ず `QueryCommand` で対象のSKを取得してから個別に削除し、最後にCognitoからユーザーを削除する手順を厳守すること。** |
| lambda/controllers/budgetController.ts | 月次予算および月次サマリー（へそくり確定履歴）の保存・取得を担当するAPIコントローラー。 |
| lambda/postConfirmation.ts | Cognito等のユーザー登録後のトリガー（Post Confirmation）を担当するLambda関数。初期ユーザーデータのセットアップ等を担当。 |
| lambda/fetchNationalStatistics.ts | EventBridgeで月次定期実行され、e-Stat等の外部統計(物価指数・平均生活費)を取得・キャッシュするバッチ処理。 |
| test/hesokuri-backend.test.ts | CDKスタックのユニットテスト（Jest）。リソースが正しく生成されるかを検証する。 |
| test/fetchNationalStatistics.test.ts | 外部統計取得バッチのユニットテスト（Jest）。APIモックやデータ変換ロジックの動作検証を行う。 |
| cdk.json / package.json / tsconfig.json 等 | CDKおよびNode.jsの設定ファイル。**【重要】`@aws-sdk/client-cognito-identity-provider` など、新たなAWS SDKをLambda内で使用する際は、必ず事前に `package.json` の依存関係に追加されているかを確認・追加すること。** |