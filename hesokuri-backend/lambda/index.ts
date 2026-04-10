// hesokuri-backend/lambda/index.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handleExpenseRequests } from './controllers/expenseController';
import { handleSettingsRequests } from './controllers/settingsController';
import { handleBudgetRequests } from './controllers/budgetController';
import { corsHeaders, buildResponse } from './utils';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME || '';
const EXPENSES_TABLE = process.env.EXPENSES_TABLE_NAME || '';
const MONTHLY_BUDGETS_TABLE = process.env.MONTHLY_BUDGETS_TABLE_NAME || '';
const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME || ''; // ▼ 追記: AccountsTableの環境変数
const SUMMARIES_TABLE = process.env.SUMMARIES_TABLE_NAME || ''; // ▼ 新規追加: 月次サマリー用テーブルの環境変数
const SYSTEM_CONFIG_TABLE = process.env.SYSTEM_CONFIG_TABLE_NAME || ''; // ▼ 新規追加: システム設定用テーブルの環境変数

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // ▼ 変更: requestContext を展開に追加
  const { httpMethod, path, requestContext } = event;
  
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // ▼ 新規追加: Cognito AuthorizerからユーザーID(sub)を強制取得
  const householdId = requestContext?.authorizer?.claims?.sub;
  if (!householdId) {
    // 【根本解決】対症療法を撤廃。代わりにCloudWatchにエラー原因を確実に記録する
    console.error(`[Auth Error] 401 Unauthorized: token missing or invalid for path: ${path}`);
    return buildResponse(401, { message: 'Unauthorized: No valid token provided' });
  }

  try {
    const normalizedPath = path.replace(/\/$/, '');

    // ルーティング: 設定・アカウント・統計関連
    if (
      normalizedPath === '/account' ||
      path.startsWith('/settings/') ||
      normalizedPath === '/statistics'
    ) {
      return await handleSettingsRequests(event, docClient, ACCOUNTS_TABLE, SETTINGS_TABLE, SYSTEM_CONFIG_TABLE, householdId);
    }

    // ルーティング: 予算・サマリー関連
    if (
      path.startsWith('/budgets/') ||
      path.startsWith('/summaries/') ||
      normalizedPath === '/summaries'
    ) {
      return await handleBudgetRequests(event, docClient, MONTHLY_BUDGETS_TABLE, SUMMARIES_TABLE, householdId);
    }

    // ルーティング: 支出関連
    if (
      normalizedPath === '/expenses' ||
      path.startsWith('/expenses/')
    ) {
      return await handleExpenseRequests(event, docClient, EXPENSES_TABLE, householdId);
    }

    // どのルートにも一致しない場合
    return buildResponse(404, { message: 'Not Found' });

  } catch (error) {
    console.error('API Error:', error);
    return buildResponse(500, { message: 'Internal Server Error', error: String(error) });
  }
};