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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
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
    return buildResponse(401, { message: 'Unauthorized: No valid token provided' });
  }

  try {
    // ▼ 新規追加: アカウント情報の取得とisAdminのフェイルセーフ
    if (httpMethod === 'GET' && path === '/account') {
      const result = await docClient.send(new GetCommand({ TableName: ACCOUNTS_TABLE, Key: { accountId: householdId } }));
      const accountData = result.Item || { accountId: householdId, email: '', subscriptionPlan: 'FREE' };
      
      // 既存のブランクユーザーへの安全対策
      if (accountData.isAdmin === undefined) {
        accountData.isAdmin = false;
      }
      
      return buildResponse(200, accountData);
    }

    if (httpMethod === 'GET' && path.startsWith('/settings/')) {
      // 変更: パスパラメータからの抽出を削除し、トークンの householdId を使用
      const result = await docClient.send(new GetCommand({ TableName: SETTINGS_TABLE, Key: { householdId } }));
      return buildResponse(200, result.Item || { message: 'Settings not found' });
    }

    if (httpMethod === 'PUT' && path.startsWith('/settings/')) {
      if (!body) return buildResponse(400, { message: 'Invalid request' });
      const settingsData = JSON.parse(body);
      settingsData.updatedAt = new Date().toISOString();
      settingsData.householdId = householdId; // トークンの値で上書き
      await docClient.send(new PutCommand({ TableName: SETTINGS_TABLE, Item: settingsData }));
      return buildResponse(200, { message: 'Settings updated', data: settingsData });
    }

    // === 新規：月次予算の取得 (GET) ===
    if (httpMethod === 'GET' && path.startsWith('/budgets/')) {
      const month_id = queryStringParameters?.month;
      if (!month_id) return buildResponse(400, { message: 'Missing parameters' });
      const result = await docClient.send(new GetCommand({
        TableName: MONTHLY_BUDGETS_TABLE,
        Key: { householdId, month_id }
      }));
      // データがない場合は空のbudgetsオブジェクトを返す
      return buildResponse(200, result.Item || { householdId, month_id, budgets: {} });
    }

    // === 新規：月次予算の保存 (PUT) ===
    if (httpMethod === 'PUT' && path.startsWith('/budgets/')) {
      if (!body) return buildResponse(400, { message: 'Invalid request' });
      const budgetData = JSON.parse(body);
      budgetData.updatedAt = new Date().toISOString();
      budgetData.householdId = householdId; // トークンの値で上書き
      await docClient.send(new PutCommand({ TableName: MONTHLY_BUDGETS_TABLE, Item: budgetData }));
      return buildResponse(200, { message: 'Budget updated', data: budgetData });
    }

    if (httpMethod === 'POST' && path === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });
      const expenseData = JSON.parse(body);
      const expenseId = randomUUID();
      const date = expenseData.date;
      if (!date || !expenseData.amount) return buildResponse(400, { message: 'Missing fields' });
      const item = { ...expenseData, householdId, id: expenseId, date_id: `${date}#${expenseId}`, createdAt: new Date().toISOString() };
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

    if (httpMethod === 'PUT' && path === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });
      const expenseData = JSON.parse(body);
      if (!expenseData.date_id) return buildResponse(400, { message: 'Missing keys' });
      expenseData.householdId = householdId; // トークンの値で上書き
      await docClient.send(new PutCommand({ TableName: EXPENSES_TABLE, Item: expenseData }));
      return buildResponse(200, { message: 'Expense updated', data: expenseData });
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