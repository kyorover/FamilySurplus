// hesokuri-backend/lambda/controllers/budgetController.ts
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse, removeEmptyStrings } from '../utils';

export const handleBudgetRequests = async (
  event: APIGatewayProxyEvent,
  docClient: DynamoDBDocumentClient,
  monthlyBudgetsTable: string,
  summariesTable: string,
  householdId: string
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, queryStringParameters, body } = event;
  const normalizedPath = path.replace(/\/$/, '');

  // === 新規：月次予算の取得 (GET) ===
  if (httpMethod === 'GET' && path.startsWith('/budgets/')) {
    const month_id = queryStringParameters?.month;
    if (!month_id) return buildResponse(400, { message: 'Missing parameters' });
    const result = await docClient.send(new GetCommand({ TableName: monthlyBudgetsTable, Key: { householdId, month_id } }));
    return buildResponse(200, result.Item || { householdId, month_id, budgets: {} });
  }

  // === 新規：月次予算の保存 (PUT) ===
  if (httpMethod === 'PUT' && path.startsWith('/budgets/')) {
    if (!body) return buildResponse(400, { message: 'Invalid request' });
    const budgetData = removeEmptyStrings(JSON.parse(body));
    budgetData.updatedAt = new Date().toISOString();
    budgetData.householdId = householdId; 
    await docClient.send(new PutCommand({ TableName: monthlyBudgetsTable, Item: budgetData }));
    return buildResponse(200, { message: 'Budget updated', data: budgetData });
  }

  // ▼ 新規追加: 指定した年の月次サマリー一覧を取得するAPI
  if (httpMethod === 'GET' && path.startsWith('/summaries/')) {
    const yearPrefix = queryStringParameters?.year; // 例: "2026"
    if (!yearPrefix) return buildResponse(400, { message: 'Missing parameters' });
    const result = await docClient.send(new QueryCommand({
      TableName: summariesTable,
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
    
    await docClient.send(new PutCommand({ TableName: summariesTable, Item: summaryData }));
    return buildResponse(201, { message: 'Monthly summary recorded', data: summaryData });
  }

  return buildResponse(404, { message: 'Endpoint not found in budget controller' });
};