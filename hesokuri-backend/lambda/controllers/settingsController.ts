// hesokuri-backend/lambda/controllers/settingsController.ts
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, removeEmptyStrings } from '../utils';

export const handleSettingsRequests = async (
  event: APIGatewayProxyEvent,
  docClient: DynamoDBDocumentClient,
  accountsTable: string,
  settingsTable: string,
  systemConfigTable: string,
  householdId: string
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, body } = event;
  const normalizedPath = path.replace(/\/$/, '');

  // GET: アカウント情報の取得と isAdmin のフェイルセーフ
  if (httpMethod === 'GET' && normalizedPath === '/account') {
    const result = await docClient.send(new GetCommand({ TableName: accountsTable, Key: { accountId: householdId } }));
    const accountData = result.Item || { accountId: householdId, email: '', subscriptionPlan: 'FREE' };
    if (accountData.isAdmin === undefined) { accountData.isAdmin = false; }
    return buildResponse(200, accountData);
  }

  // GET: 世帯設定の取得
  if (httpMethod === 'GET' && path.startsWith('/settings/')) {
    const result = await docClient.send(new GetCommand({ TableName: settingsTable, Key: { householdId } }));
    return buildResponse(200, result.Item || { message: 'Settings not found' });
  }

  // PUT: 世帯設定の更新
  if (httpMethod === 'PUT' && path.startsWith('/settings/')) {
    if (!body) return buildResponse(400, { message: 'Invalid request' });
    const settingsData = removeEmptyStrings(JSON.parse(body));
    settingsData.updatedAt = new Date().toISOString();
    settingsData.householdId = householdId; 
    await docClient.send(new PutCommand({ TableName: settingsTable, Item: settingsData }));
    return buildResponse(200, { message: 'Settings updated', data: settingsData });
  }

  // GET: バックエンドでキャッシュされた最新の公的統計データを取得
  if (httpMethod === 'GET' && normalizedPath === '/statistics') {
    const result = await docClient.send(new QueryCommand({
      TableName: systemConfigTable,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': 'CONFIG#STATISTICS',
        ':skPrefix': 'MONTH#'
      },
      ScanIndexForward: false, // 降順ソート（最新月を1件取得）
      Limit: 1
    }));
    // バッチ実行前でデータが存在しない場合はnullを返す
    const statsData = result.Items && result.Items.length > 0 ? result.Items[0].data : null;
    return buildResponse(200, { data: statsData });
  }

  return buildResponse(404, { message: 'Endpoint not found in settings controller' });
};