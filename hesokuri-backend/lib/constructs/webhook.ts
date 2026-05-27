// hesokuri-backend/lib/constructs/webhook.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export interface WebhookConstructProps {
  api: apigateway.LambdaRestApi;
  accountsTable: dynamodb.ITable;
  envName: string;
}

export class WebhookConstruct extends Construct {
  constructor(scope: Construct, id: string, props: WebhookConstructProps) {
    super(scope, id);

    const envName = props.envName;

    // === RevenueCat Webhook受信用 Lambda 関数 ===
    const webhookHandler = new NodejsFunction(this, 'RevenueCatWebhookHandler', {
      functionName: `RevenueCatWebhookHandler-${envName}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../lambda/controllers/webhookController.ts'),
      handler: 'handleWebhook',
      environment: {
        ACCOUNTS_TABLE_NAME: props.accountsTable.tableName,
        // 【セキュリティ注意】認証トークンはSecrets Manager等から取得するのがベストプラクティスです。
        // ここでは環境変数として定義し、実際の値はデプロイ環境のパラメータ等から注入してください。
        REVENUECAT_WEBHOOK_AUTH_TOKEN: process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN || 'dummy-token',
      },
      timeout: cdk.Duration.seconds(10),
    });

    // LambdaへDynamoDBテーブルの書き込み権限を付与
    props.accountsTable.grantReadWriteData(webhookHandler);

    // === API Gateway へのルート追加とCognito認可のバイパス設定 ===
    // 既存の全体API（Cognito認可がデフォルト適用されている）のルート配下に、
    // 外部SaaS（RevenueCat）が直接叩ける未認証（NONE）のエンドポイントを開放します。
    
    // /webhooks リソースの作成
    const webhooksResource = props.api.root.addResource('webhooks');
    
    // /webhooks/revenuecat リソースの作成
    const revenueCatResource = webhooksResource.addResource('revenuecat');

    // POSTメソッドの追加（Cognito認証を明示的にNONEに上書き）
    revenueCatResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(webhookHandler),
      {
        authorizationType: apigateway.AuthorizationType.NONE,
      }
    );
  }
}