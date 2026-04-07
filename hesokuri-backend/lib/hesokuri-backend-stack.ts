// hesokuri-backend/lib/hesokuri-backend-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

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
    // ============================================

    const settingsTable = new dynamodb.Table(this, 'HouseholdSettingsTable', {
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    const expensesTable = new dynamodb.Table(this, 'ExpenseRecordsTable', {
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：月次予算テーブル ===
    const monthlyBudgetsTable = new dynamodb.Table(this, 'MonthlyBudgetsTable', {
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'month_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：アカウント・課金情報テーブル ===
    const accountsTable = new dynamodb.Table(this, 'AccountsTable', {
      partitionKey: { name: 'accountId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const apiHandler = new NodejsFunction(this, 'HesokuriApiHandler', {
      runtime: lambda.Runtime.NODEJS_22_X, // Node.js 22 LTSへ更新
      entry: path.join(__dirname, '../lambda/index.ts'),
      handler: 'handler',
      environment: {
        SETTINGS_TABLE_NAME: settingsTable.tableName,
        EXPENSES_TABLE_NAME: expensesTable.tableName,
        MONTHLY_BUDGETS_TABLE_NAME: monthlyBudgetsTable.tableName, // 新テーブルを環境変数へ追加
        ACCOUNTS_TABLE_NAME: accountsTable.tableName, // 新テーブルを環境変数へ追加
      },
      timeout: cdk.Duration.seconds(10),
    });

    settingsTable.grantReadWriteData(apiHandler);
    expensesTable.grantReadWriteData(apiHandler);
    monthlyBudgetsTable.grantReadWriteData(apiHandler); // 新テーブルへのアクセス権限を付与
    accountsTable.grantReadWriteData(apiHandler); // 新テーブルへのアクセス権限を付与

    const api = new apigateway.LambdaRestApi(this, 'HesokuriApi', {
      handler: apiHandler,
      proxy: true,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
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
        ACCOUNTS_TABLE_NAME: accountsTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
    });
    
    // Lambdaにテーブルへの書き込み権限を付与
    accountsTable.grantReadWriteData(postConfirmationHandler);
    
    // UserPoolの定義順序を変えずに、後からトリガーを追加する
    userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, postConfirmationHandler);
  }
}