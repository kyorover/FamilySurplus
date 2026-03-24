import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

// ==========================================
// 1. クライアント初期化と環境変数設定
// ==========================================
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const SETTINGS_TABLE = process.env.SETTINGS_TABLE_NAME || '';
const EXPENSES_TABLE = process.env.EXPENSES_TABLE_NAME || '';

// ==========================================
// 2. CORS用ヘッダーの共通定義
// ==========================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

// ==========================================
// 3. メインハンドラー（ルーティング）
// ==========================================
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
  
  // CORS プレフライトリクエストへの対応
  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // --- 3.1. マスタ設定の取得 (GET /settings/{householdId}) ---
    if (httpMethod === 'GET' && path.startsWith('/settings/')) {
      const householdId = pathParameters?.householdId;
      if (!householdId) return buildResponse(400, { message: 'householdId is required' });

      const result = await docClient.send(new GetCommand({
        TableName: SETTINGS_TABLE,
        Key: { householdId }
      }));

      return buildResponse(200, result.Item || { message: 'Settings not found' });
    }

    // --- 3.2. マスタ設定の更新 (PUT /settings/{householdId}) ---
    if (httpMethod === 'PUT' && path.startsWith('/settings/')) {
      const householdId = pathParameters?.householdId;
      if (!householdId || !body) return buildResponse(400, { message: 'Invalid request' });

      const settingsData = JSON.parse(body);
      // 更新日時の自動付与
      settingsData.updatedAt = new Date().toISOString();
      settingsData.householdId = householdId; // URLパスのIDを強制

      await docClient.send(new PutCommand({
        TableName: SETTINGS_TABLE,
        Item: settingsData
      }));

      return buildResponse(200, { message: 'Settings updated successfully', data: settingsData });
    }

    // --- 3.3. 支出の記録 (POST /expenses) ---
    if (httpMethod === 'POST' && path === '/expenses') {
      if (!body) return buildResponse(400, { message: 'Request body is required' });

      const expenseData = JSON.parse(body);
      const expenseId = randomUUID();
      const date = expenseData.date; // YYYY-MM-DD
      const householdId = expenseData.householdId;

      if (!householdId || !date || !expenseData.amount) {
        return buildResponse(400, { message: 'Missing required fields' });
      }

      const item = {
        ...expenseData,
        id: expenseId,
        // DynamoDBの高速クエリ用ソートキー生成: "YYYY-MM-DD#UUID"
        date_id: `${date}#${expenseId}`,
        createdAt: new Date().toISOString()
      };

      await docClient.send(new PutCommand({
        TableName: EXPENSES_TABLE,
        Item: item
      }));

      return buildResponse(201, { message: 'Expense recorded successfully', data: item });
    }

    // --- 3.4. 特定月の支出一覧取得 (GET /expenses/{householdId}?month=YYYY-MM) ---
    if (httpMethod === 'GET' && path.startsWith('/expenses/')) {
      const householdId = pathParameters?.householdId;
      const monthPrefix = queryStringParameters?.month; // "2026-03" のような形式を期待

      if (!householdId || !monthPrefix) {
        return buildResponse(400, { message: 'householdId and month parameter are required' });
      }

      // begins_with を使用して特定月のレコードのみを高速抽出
      const result = await docClient.send(new QueryCommand({
        TableName: EXPENSES_TABLE,
        KeyConditionExpression: 'householdId = :hid AND begins_with(date_id, :month)',
        ExpressionAttributeValues: {
          ':hid': householdId,
          ':month': monthPrefix
        }
      }));

      return buildResponse(200, { 
        expenses: result.Items || [],
        count: result.Count 
      });
    }

    // エンドポイントが見つからない場合
    return buildResponse(404, { message: 'Not Found' });

  } catch (error) {
    console.error('API Error:', error);
    return buildResponse(500, { message: 'Internal Server Error', error: String(error) });
  }
};

// ==========================================
// 4. レスポンス生成用ユーティリティ
// ==========================================
const buildResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
};