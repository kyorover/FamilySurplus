// hesokuri-backend/lambda/index.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME || '';
const EXPENSES_TABLE = process.env.EXPENSES_TABLE_NAME || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, queryStringParameters, body } = event;
  
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // --- 1. マスタ設定の取得 ---
    if (httpMethod === 'GET' && path.startsWith('/settings/')) {
      const householdId = path.split('/')[2];
      if (!householdId) return buildResponse(400, { message: 'householdId is required' });

      const result = await docClient.send(new GetCommand({ TableName: SETTINGS_TABLE, Key: { householdId } }));
      return buildResponse(200, result.Item || { message: 'Settings not found' });
    }

    // --- 2. マスタ設定の更新 ---
    if (httpMethod === 'PUT' && path.startsWith('/settings/')) {
      const householdId = path.split('/')[2];
      if (!householdId || !body) return buildResponse(400, { message: 'Invalid request' });

      const settingsData = JSON.parse(body);
      settingsData.updatedAt = new Date().toISOString();
      settingsData.householdId = householdId;

      await docClient.send(new PutCommand({ TableName: SETTINGS_TABLE, Item: settingsData }));
      return buildResponse(200, { message: 'Settings updated', data: settingsData });
    }

    // --- 3. 支出の記録 (POST) ---
    if (httpMethod === 'POST' && path === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });

      const expenseData = JSON.parse(body);
      const expenseId = randomUUID();
      const date = expenseData.date;
      const householdId = expenseData.householdId;

      if (!householdId || !date || !expenseData.amount) return buildResponse(400, { message: 'Missing fields' });

      const item = { ...expenseData, id: expenseId, date_id: `${date}#${expenseId}`, createdAt: new Date().toISOString() };
      await docClient.send(new PutCommand({ TableName: EXPENSES_TABLE, Item: item }));
      return buildResponse(201, { message: 'Expense recorded', data: item });
    }

    // --- 4. 支出一覧取得 (GET) ---
    if (httpMethod === 'GET' && path.startsWith('/expenses/')) {
      const householdId = path.split('/')[2];
      const monthPrefix = queryStringParameters?.month;
      if (!householdId || !monthPrefix) return buildResponse(400, { message: 'Missing parameters' });

      const result = await docClient.send(new QueryCommand({
        TableName: EXPENSES_TABLE,
        KeyConditionExpression: 'householdId = :hid AND begins_with(date_id, :month)',
        ExpressionAttributeValues: { ':hid': householdId, ':month': monthPrefix }
      }));
      return buildResponse(200, { expenses: result.Items || [], count: result.Count });
    }

    // --- 5. 支出の更新 (PUT) ---
    if (httpMethod === 'PUT' && path === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });
      const expenseData = JSON.parse(body);
      if (!expenseData.householdId || !expenseData.date_id) return buildResponse(400, { message: 'Missing keys' });

      await docClient.send(new PutCommand({ TableName: EXPENSES_TABLE, Item: expenseData }));
      return buildResponse(200, { message: 'Expense updated', data: expenseData });
    }

    // --- 6. 支出の削除 (DELETE) ---
    if (httpMethod === 'DELETE' && path.startsWith('/expenses/')) {
      const householdId = path.split('/')[2];
      const date_id = queryStringParameters?.date_id;
      if (!householdId || !date_id) return buildResponse(400, { message: 'Missing keys' });

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