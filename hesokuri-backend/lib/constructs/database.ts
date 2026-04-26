// hesokuri-backend/lib/constructs/database.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class DatabaseConstruct extends Construct {
  public readonly settingsTable: dynamodb.Table;
  public readonly expensesTable: dynamodb.Table;
  public readonly monthlyBudgetsTable: dynamodb.Table;
  public readonly accountsTable: dynamodb.Table;
  public readonly summariesTable: dynamodb.Table;
  public readonly systemConfigTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // コンテキストから環境名を取得（デフォルトは 'dev'）
    const envName = this.node.tryGetContext('env') || 'dev';

    this.settingsTable = new dynamodb.Table(this, 'HouseholdSettingsTable', {
      tableName: `HouseholdSettings-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    this.expensesTable = new dynamodb.Table(this, 'ExpenseRecordsTable', {
      tableName: `ExpenseRecords-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'date_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：月次予算テーブル ===
    this.monthlyBudgetsTable = new dynamodb.Table(this, 'MonthlyBudgetsTable', {
      tableName: `MonthlyBudgets-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'month_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：アカウント・課金情報テーブル ===
    this.accountsTable = new dynamodb.Table(this, 'AccountsTable', {
      tableName: `Accounts-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'accountId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：月次サマリー（へそくり確定履歴）テーブル ===
    this.summariesTable = new dynamodb.Table(this, 'MonthlySummariesTable', {
      tableName: `MonthlySummaries-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'householdId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'month_id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // === 新規追加：システム設定・統計データキャッシュテーブル ===
    this.systemConfigTable = new dynamodb.Table(this, 'SystemConfigTable', {
      tableName: `SystemConfig-${envName}`, // ▼ 新規追加：環境名を付与
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}