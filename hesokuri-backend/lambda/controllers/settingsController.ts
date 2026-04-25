// hesokuri-backend/lambda/controllers/settingsController.ts
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, removeEmptyStrings } from '../utils';

export const handleSettingsRequests = async (
  event: APIGatewayProxyEvent,
  docClient: DynamoDBDocumentClient,
  accountsTable: string,
  settingsTable: string,
  systemConfigTable: string,
  expensesTable: string,       // ▼ 削除処理用に追加
  monthlyBudgetsTable: string, // ▼ 削除処理用に追加
  summariesTable: string,      // ▼ 削除処理用に追加
  userPoolId: string,          // ▼ 削除処理用に追加
  householdId: string
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, body } = event;
  const normalizedPath = path.replace(/\/$/, '');

  // DELETE: アカウント削除（退会処理）
  // Apple審査要件に基づき、関連する全データの物理削除とCognitoユーザー削除を実行
  if (httpMethod === 'DELETE' && normalizedPath === '/account') {
    try {
      // 1. PKのみのテーブルからデータを削除
      await Promise.all([
        docClient.send(new DeleteCommand({ TableName: accountsTable, Key: { accountId: householdId } })),
        docClient.send(new DeleteCommand({ TableName: settingsTable, Key: { householdId } }))
      ]);

      // 2. PK + SK を持つテーブルのデータを削除するためのヘルパー関数
      const deleteWithSortKey = async (tableName: string, skName: string) => {
        const res = await docClient.send(new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: 'householdId = :hid',
          ExpressionAttributeValues: { ':hid': householdId }
        }));
        if (res.Items && res.Items.length > 0) {
          await Promise.all(res.Items.map(item =>
            docClient.send(new DeleteCommand({
              TableName: tableName,
              Key: { householdId, [skName]: item[skName] }
            }))
          ));
        }
      };

      // 各テーブルのデータを検索＆削除
      await Promise.all([
        deleteWithSortKey(expensesTable, 'date_id'),
        deleteWithSortKey(monthlyBudgetsTable, 'month_id'),
        deleteWithSortKey(summariesTable, 'month_id')
      ]);

      // 3. Cognitoからユーザーを完全に削除
      const cognitoClient = new CognitoIdentityProviderClient({});
      await cognitoClient.send(new AdminDeleteUserCommand({
        UserPoolId: userPoolId,
        Username: householdId, // subをUsernameとして指定
      }));

      return buildResponse(200, { message: 'Account and all related data deleted successfully' });
    } catch (error) {
      console.error('[Delete Account Error]:', error);
      return buildResponse(500, { message: 'Failed to delete account', error: String(error) });
    }
  }

  // GET: アカウント情報の取得と isAdmin のフェイルセーフ
  if (httpMethod === 'GET' && normalizedPath === '/account') {
    const result = await docClient.send(new GetCommand({ TableName: accountsTable, Key: { accountId: householdId } }));
    const accountData = result.Item || { accountId: householdId, email: '', subscriptionPlan: 'FREE' };
    if (accountData.isAdmin === undefined) { accountData.isAdmin = false; }
    return buildResponse(200, accountData);
  }

  // PUT: アカウント情報の更新
  if (httpMethod === 'PUT' && normalizedPath === '/account') {
    if (!body) return buildResponse(400, { message: 'Invalid request' });
    const updateData = removeEmptyStrings(JSON.parse(body));
    updateData.accountId = householdId;
    // 作成日時がない場合は現在時刻を付与
    if (!updateData.createdAt) { updateData.createdAt = new Date().toISOString(); }
    await docClient.send(new PutCommand({ TableName: accountsTable, Item: updateData }));
    return buildResponse(200, { message: 'Account updated', data: updateData });
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