# 01-C_プロジェクトファイル定義書(backend)

## 1. バックエンド (hesokuri-backend/)
AWS CDKを用いたサーバーレスアーキテクチャ（TypeScript）。外部APIからのデータ取得やDynamoDBへの保存を担当。フロントエンドからの直接的な外部API呼び出しを避けるための層。

| ファイルパス | AI向け責務・制約（コーディング時の前提知識） |
| :--- | :--- |
| bin/hesokuri-backend.ts | CDKアプリのエントリポイント。スタックのインスタンス化のみを行う。 |
| lib/hesokuri-backend-stack.ts | AWSリソース（API Gateway, Lambda, DynamoDB, EventBridge等）のインフラ定義（IaC）。リソースの追加・変更時はここを修正する。 |
| lib/constructs/database.ts | DynamoDBテーブル群の定義を切り出したConstruct。スタックの行数肥大化を防ぐ単一責務ファイル。 |
| lambda/index.ts | API Gatewayからの全リクエストを受け付け、認証ID(sub)を取得後、各ドメインのコントローラーへ処理を委譲するルーター。 |
| lambda/utils.ts | APIのCORSレスポンス生成や、DynamoDB保存時の空文字削除などを担当する共通純粋関数群。 |
| lambda/controllers/expenseController.ts | 支出データの登録・取得・更新・削除（CRUD）を担当するAPIコントローラー。 |
| lambda/controllers/settingsController.ts | アカウント情報、世帯設定、キャッシュされた外部統計データの取得・更新を担当するAPIコントローラー。 |
| lambda/controllers/budgetController.ts | 月次予算および月次サマリー（へそくり確定履歴）の保存・取得を担当するAPIコントローラー。 |
| lambda/postConfirmation.ts | Cognito等のユーザー登録後のトリガー（Post Confirmation）を担当するLambda関数。初期ユーザーデータのセットアップ等を担当。 |
| lambda/fetchNationalStatistics.ts | EventBridgeで月次定期実行され、e-Stat等の外部統計(物価指数・平均生活費)を取得・キャッシュするバッチ処理。 |
| test/hesokuri-backend.test.ts | CDKスタックのユニットテスト（Jest）。リソースが正しく生成されるかを検証する。 |
| cdk.json / package.json / tsconfig.json 等 | CDKおよびNode.jsの設定ファイル。依存関係の管理。 |
