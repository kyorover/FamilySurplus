// hesokuri-backend/lib/hesokuri-backend-stack.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class HesokuriBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    const apiHandler = new NodejsFunction(this, 'HesokuriApiHandler', {
      runtime: lambda.Runtime.NODEJS_22_X, // Node.js 22 LTSへ更新
      entry: path.join(__dirname, '../lambda/index.ts'),
      handler: 'handler',
      environment: {
        SETTINGS_TABLE_NAME: settingsTable.tableName,
        EXPENSES_TABLE_NAME: expensesTable.tableName,
        MONTHLY_BUDGETS_TABLE_NAME: monthlyBudgetsTable.tableName, // 新テーブルを環境変数へ追加
      },
      timeout: cdk.Duration.seconds(10),
    });

    settingsTable.grantReadWriteData(apiHandler);
    expensesTable.grantReadWriteData(apiHandler);
    monthlyBudgetsTable.grantReadWriteData(apiHandler); // 新テーブルへのアクセス権限を付与

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