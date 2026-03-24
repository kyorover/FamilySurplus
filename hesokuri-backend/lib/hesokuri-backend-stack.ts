import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'; // ★追加: 自動変換用のモジュール
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class HesokuriBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // 1. DynamoDB テーブルの作成
    // ==========================================
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

    // ==========================================
    // 2. Lambda 関数の作成 (自動変換対応版)
    // ==========================================
    const apiHandler = new NodejsFunction(this, 'HesokuriApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/index.ts'), // ★変更: .tsファイルを直接指定
      handler: 'handler',
      environment: {
        SETTINGS_TABLE_NAME: settingsTable.tableName,
        EXPENSES_TABLE_NAME: expensesTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Lambda関数にDynamoDBへの読み書き権限を付与
    settingsTable.grantReadWriteData(apiHandler);
    expensesTable.grantReadWriteData(apiHandler);

    // ==========================================
    // 3. API Gateway の作成
    // ==========================================
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
  }
}