// hesokuri-backend/lib/hesokuri-backend-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as events from 'aws-cdk-lib/aws-events'; // ▼ 新規追加: EventBridge
import * as targets from 'aws-cdk-lib/aws-events-targets'; // ▼ 新規追加: EventBridge Targets
import * as path from 'path';
import { DatabaseConstruct } from './constructs/database'; // ▼ 新規追加: テーブル定義の分離

export class HesokuriBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // === Cognito User Pool (認証基盤) ===
    const userPool = new cognito.UserPool(this, 'HesokuriUserPool', {
      userPoolName: 'hesokuri-users',
      signInAliases: { email: true },
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      // ▼ 新規追加: パスワードリセットをユーザーセルフで行えるように明示的に設定
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'HesokuriUserPoolClient', {
      userPool,
      generateSecret: false,
      // ▼ 新規追加: パスワード認証フローを許可する
      authFlows: {
        userPassword: true,
      },
    });

    // === データベース層の構築 (別ファイルに分離) ===
    const db = new DatabaseConstruct(this, 'DatabaseLayer');

    // === APIハンドラー (Lambda) ===
    const apiHandler = new NodejsFunction(this, 'HesokuriApiHandler', {
      runtime: lambda.Runtime.NODEJS_22_X, // Node.js 22 LTSへ更新
      entry: path.join(__dirname, '../lambda/index.ts'),
      handler: 'handler',
      environment: {
        SETTINGS_TABLE_NAME: db.settingsTable.tableName,
        EXPENSES_TABLE_NAME: db.expensesTable.tableName,
        MONTHLY_BUDGETS_TABLE_NAME: db.monthlyBudgetsTable.tableName,
        ACCOUNTS_TABLE_NAME: db.accountsTable.tableName,
        SUMMARIES_TABLE_NAME: db.summariesTable.tableName, // ▼ 環境変数に追加
        SYSTEM_CONFIG_TABLE_NAME: db.systemConfigTable.tableName, // ▼ 環境変数に追加
      },
      timeout: cdk.Duration.seconds(10),
    });

    // 権限の付与
    db.settingsTable.grantReadWriteData(apiHandler);
    db.expensesTable.grantReadWriteData(apiHandler);
    db.monthlyBudgetsTable.grantReadWriteData(apiHandler);
    db.accountsTable.grantReadWriteData(apiHandler);
    db.summariesTable.grantReadWriteData(apiHandler);
    db.systemConfigTable.grantReadWriteData(apiHandler); // 統計データ読み取り用

    // ▼ 新規追加: API Gateway用のCognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'HesokuriAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const api = new apigateway.LambdaRestApi(this, 'HesokuriApi', {
      handler: apiHandler,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      // ▼ 新規追加: API全体にCognito Authorizerを適用し、未認証リクエストをブロック
      defaultMethodOptions: {
        authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    });

    new cdk.CfnOutput(this, 'ApiEndpointUrl', {
      value: api.url,
      description: 'The endpoint URL for the Hesokuri API',
    });

    // === 新規追加: Cognito 出力 ===
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'ClientId', { value: userPoolClient.userPoolClientId });

    // ▼ 新規追加: サインアップ完了時の DynamoDB 初期レコード作成トリガー
    const postConfirmationHandler = new NodejsFunction(this, 'PostConfirmationHandler', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../lambda/postConfirmation.ts'),
      handler: 'handler',
      environment: {
        ACCOUNTS_TABLE_NAME: db.accountsTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
    });
    
    db.accountsTable.grantReadWriteData(postConfirmationHandler);
    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmationHandler);

    // === 新規追加: 外部統計データ取得用バッチLambda ===
    const fetchNationalStatisticsBatch = new NodejsFunction(this, 'FetchNationalStatisticsBatch', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../lambda/fetchNationalStatistics.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: db.systemConfigTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    db.systemConfigTable.grantReadWriteData(fetchNationalStatisticsBatch);

    // === 新規追加: バッチの定期実行スケジュール設定 (毎月1日 03:00 JST = 前月末日 18:00 UTC) ===
    new events.Rule(this, 'MonthlyStatisticsFetchRule', {
      schedule: events.Schedule.cron({
        minute: '0',
        hour: '18',
        day: 'L', // 前月の末日
        month: '*',
        year: '*',
      }),
      targets: [new targets.LambdaFunction(fetchNationalStatisticsBatch)],
    });
  }
}