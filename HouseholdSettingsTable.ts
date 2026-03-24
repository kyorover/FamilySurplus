import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class HesokuriBackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ==========================================
    // 1. マスタ設定用テーブル (HouseholdSettings)
    // ==========================================
    // 用途: 家族構成、カテゴリ設定、小遣い設定など、世帯ごとのルート設定を保存。
    // 特徴: types.tsの HouseholdSettings オブジェクトを1つのアイテムとして丸ごとJSON保存する設計。
    const settingsTable = new dynamodb.Table(this, 'HouseholdSettingsTable', {
      partitionKey: { 
        name: 'householdId', 
        type: dynamodb.AttributeType.STRING 
      },
      // プロトタイプ用の設定（トラフィックに応じた自動スケールでコストを最小化）
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // ※本番環境では RETAIN に変更しますが、開発中はスタック削除時にテーブルも消す設定
      removalPolicy: cdk.RemovalPolicy.DESTROY, 
    });

    // ==========================================
    // 2. 支出記録用テーブル (ExpenseRecords)
    // ==========================================
    // 用途: 日々の支出（へそくりを減らす要素）の記録。※収入レコードは存在しない。
    const expensesTable = new dynamodb.Table(this, 'ExpenseRecordsTable', {
      partitionKey: { 
        name: 'householdId', 
        type: dynamodb.AttributeType.STRING 
      },
      // ソートキーを "YYYY-MM-DD#UUID" とすることで、特定の月の支出一覧を高速に取得可能にする
      sortKey: { 
        name: 'date_id', 
        type: dynamodb.AttributeType.STRING 
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- グローバルセカンダリインデックス (GSI) の追加 ---
    
    // GSI 1: カテゴリ別の集計用インデックス
    // ダッシュボード画面の「プログレスバー」を描画する際、カテゴリごとの支出合計を高速に取得するため
    expensesTable.addGlobalSecondaryIndex({
      indexName: 'ByCategoryIndex',
      partitionKey: { 
        name: 'householdId', 
        type: dynamodb.AttributeType.STRING 
      },
      sortKey: { 
        name: 'categoryId', 
        type: dynamodb.AttributeType.STRING 
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI 2: 支払者（財布）別の集計用インデックス
    // 「夫の財布からいくら出たか」「共通口座からいくら出たか」を後から集計・精算するため
    expensesTable.addGlobalSecondaryIndex({
      indexName: 'ByPayerIndex',
      partitionKey: { 
        name: 'householdId', 
        type: dynamodb.AttributeType.STRING 
      },
      sortKey: { 
        name: 'payerId', 
        type: dynamodb.AttributeType.STRING 
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ==========================================
    // 3. CloudFormation出力 (Output)
    // ==========================================
    // フロントエンドやAPI層がテーブル名を参照できるように出力
    new cdk.CfnOutput(this, 'SettingsTableName', {
      value: settingsTable.tableName,
      description: 'The name of the DynamoDB table for Household Settings',
    });

    new cdk.CfnOutput(this, 'ExpensesTableName', {
      value: expensesTable.tableName,
      description: 'The name of the DynamoDB table for Expense Records',
    });
  }
}