// hesokuri-backend/lambda/index.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME || '';
const EXPENSES_TABLE = process.env.EXPENSES_TABLE_NAME || '';
const MONTHLY_BUDGETS_TABLE = process.env.MONTHLY_BUDGETS_TABLE_NAME || '';
const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME || ''; // ▼ 追記: AccountsTableの環境変数
const SUMMARIES_TABLE = process.env.SUMMARIES_TABLE_NAME || ''; // ▼ 新規追加: 月次サマリー用テーブルの環境変数

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

// DynamoDBのエラー（ValidationException）を防ぐため、空文字プロパティを安全に削除する純粋関数
const removeEmptyStrings = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === '') {
      delete newObj[key];
    }
  });
  return newObj;
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // ▼ 変更: requestContext を展開に追加
  const { httpMethod, path, queryStringParameters, body, requestContext } = event;
  
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

    // ▼ 新規追加: アカウント情報の取得とisAdminのフェイルセーフ
    if (httpMethod === 'GET' && normalizedPath === '/account') {
      const result = await docClient.send(new GetCommand({ TableName: ACCOUNTS_TABLE, Key: { accountId: householdId } }));
      const accountData = result.Item || { accountId: householdId, email: '', subscriptionPlan: 'FREE' };
      if (accountData.isAdmin === undefined) { accountData.isAdmin = false; }
      return buildResponse(200, accountData);
    }

    if (httpMethod === 'GET' && path.startsWith('/settings/')) {
      const result = await docClient.send(new GetCommand({ TableName: SETTINGS_TABLE, Key: { householdId } }));
      return buildResponse(200, result.Item || { message: 'Settings not found' });
    }

    if (httpMethod === 'PUT' && path.startsWith('/settings/')) {
      if (!body) return buildResponse(400, { message: 'Invalid request' });
      const settingsData = removeEmptyStrings(JSON.parse(body));
      settingsData.updatedAt = new Date().toISOString();
      settingsData.householdId = householdId; 
      await docClient.send(new PutCommand({ TableName: SETTINGS_TABLE, Item: settingsData }));
      return buildResponse(200, { message: 'Settings updated', data: settingsData });
    }

    // === 新規：月次予算の取得 (GET) ===
    if (httpMethod === 'GET' && path.startsWith('/budgets/')) {
      const month_id = queryStringParameters?.month;
      if (!month_id) return buildResponse(400, { message: 'Missing parameters' });
      const result = await docClient.send(new GetCommand({ TableName: MONTHLY_BUDGETS_TABLE, Key: { householdId, month_id } }));
      return buildResponse(200, result.Item || { householdId, month_id, budgets: {} });
    }

    // === 新規：月次予算の保存 (PUT) ===
    if (httpMethod === 'PUT' && path.startsWith('/budgets/')) {
      if (!body) return buildResponse(400, { message: 'Invalid request' });
      const budgetData = removeEmptyStrings(JSON.parse(body));
      budgetData.updatedAt = new Date().toISOString();
      budgetData.householdId = householdId; 
      await docClient.send(new PutCommand({ TableName: MONTHLY_BUDGETS_TABLE, Item: budgetData }));
      return buildResponse(200, { message: 'Budget updated', data: budgetData });
    }

    // ▼ 新規追加: 指定した年の月次サマリー一覧を取得するAPI
    if (httpMethod === 'GET' && path.startsWith('/summaries/')) {
      const yearPrefix = queryStringParameters?.year; // 例: "2026"
      if (!yearPrefix) return buildResponse(400, { message: 'Missing parameters' });
      const result = await docClient.send(new QueryCommand({
        TableName: SUMMARIES_TABLE,
        KeyConditionExpression: 'householdId = :hid AND begins_with(month_id, :year)',
        ExpressionAttributeValues: { ':hid': householdId, ':year': yearPrefix }
      }));
      return buildResponse(200, { summaries: result.Items || [] });
    }

    // === 新規：月次サマリー（へそくり確定履歴）の保存 (POST) ===
    if (httpMethod === 'POST' && normalizedPath === '/summaries') {
      if (!body) return buildResponse(400, { message: 'Invalid request' });
      const summaryData = removeEmptyStrings(JSON.parse(body));
      
      // フロントエンドのIDを盲信せず、AuthorizerのIDで上書き（セキュリティ対策）
      summaryData.householdId = householdId;
      summaryData.updatedAt = new Date().toISOString();
      
      await docClient.send(new PutCommand({ TableName: SUMMARIES_TABLE, Item: summaryData }));
      return buildResponse(201, { message: 'Monthly summary recorded', data: summaryData });
    }

    if (httpMethod === 'POST' && normalizedPath === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });
      const expenseData = JSON.parse(body);
      const expenseId = expenseData.id || randomUUID();
      const date = expenseData.date;
      if (!date || !expenseData.amount) return buildResponse(400, { message: 'Missing fields' });
      const item = removeEmptyStrings({ ...expenseData, householdId, id: expenseId, date_id: expenseData.date_id || `${date}#${expenseId}`, createdAt: expenseData.createdAt || new Date().toISOString() });
      await docClient.send(new PutCommand({ TableName: EXPENSES_TABLE, Item: item }));
      return buildResponse(201, { message: 'Expense recorded', data: item });
    }

    if (httpMethod === 'GET' && path.startsWith('/expenses/')) {
      const monthPrefix = queryStringParameters?.month;
      if (!monthPrefix) return buildResponse(400, { message: 'Missing parameters' });
      const result = await docClient.send(new QueryCommand({
        TableName: EXPENSES_TABLE,
        KeyConditionExpression: 'householdId = :hid AND begins_with(date_id, :month)',
        ExpressionAttributeValues: { ':hid': householdId, ':month': monthPrefix }
      }));
      return buildResponse(200, { expenses: result.Items || [], count: result.Count });
    }

    if (httpMethod === 'PUT' && normalizedPath === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });
      const expenseData = JSON.parse(body);
      if (!expenseData.date_id) return buildResponse(400, { message: 'Missing keys' });
      const item = removeEmptyStrings({ ...expenseData, householdId }); 
      await docClient.send(new PutCommand({ TableName: EXPENSES_TABLE, Item: item }));
      return buildResponse(200, { message: 'Expense updated', data: item });
    }

    if (httpMethod === 'DELETE' && path.startsWith('/expenses/')) {
      const date_id = queryStringParameters?.date_id;
      if (!date_id) return buildResponse(400, { message: 'Missing keys' });
      await docClient.send(new DeleteCommand({ TableName: EXPENSES_TABLE, Key: { householdId, date_id } }));
      return buildResponse(200, { message: 'Expense deleted' });
    }

    return buildResponse(404, { message: 'Not Found' });
  } catch (error) {
    console.error('API Error:', error);
    return buildResponse(500, { message: 'Internal Server Error', error: String(error) });
  }
};

const buildResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
};