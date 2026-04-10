// hesokuri-backend/lambda/controllers/expenseController.ts
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { buildResponse, removeEmptyStrings } from '../utils';

export const handleExpenseRequests = async (
  event: APIGatewayProxyEvent,
  docClient: DynamoDBDocumentClient,
  tableName: string,
  householdId: string
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, queryStringParameters, body } = event;
  const normalizedPath = path.replace(/\/$/, '');

  // POST: 支出の登録
  if (httpMethod === 'POST' && normalizedPath === '/expenses') {
    if (!body) return buildResponse(400, { message: 'Request body is required' });
    const expenseData = JSON.parse(body);
    const expenseId = expenseData.id || randomUUID();
    const date = expenseData.date;
    
    if (!date || !expenseData.amount) return buildResponse(400, { message: 'Missing fields' });
    
    const item = removeEmptyStrings({ 
      ...expenseData, 
      householdId, 
      id: expenseId, 
      date_id: expenseData.date_id || `${date}#${expenseId}`, 
      createdAt: expenseData.createdAt || new Date().toISOString() 
    });
    
    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    return buildResponse(201, { message: 'Expense recorded', data: item });
  }

  // GET: 指定月の支出一覧取得
  if (httpMethod === 'GET' && path.startsWith('/expenses/')) {
    const monthPrefix = queryStringParameters?.month;
    if (!monthPrefix) return buildResponse(400, { message: 'Missing parameters' });
    
    const result = await docClient.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'householdId = :hid AND begins_with(date_id, :month)',
      ExpressionAttributeValues: { ':hid': householdId, ':month': monthPrefix }
    }));
    
    return buildResponse(200, { expenses: result.Items || [], count: result.Count });
  }

  // PUT: 支出の更新
  if (httpMethod === 'PUT' && normalizedPath === '/expenses') {
    if (!body) return buildResponse(400, { message: 'Request body is required' });
    const expenseData = JSON.parse(body);
    
    if (!expenseData.date_id) return buildResponse(400, { message: 'Missing keys' });
    
    const item = removeEmptyStrings({ ...expenseData, householdId }); 
    await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
    return buildResponse(200, { message: 'Expense updated', data: item });
  }

  // DELETE: 支出の削除
  if (httpMethod === 'DELETE' && path.startsWith('/expenses/')) {
    const date_id = queryStringParameters?.date_id;
    if (!date_id) return buildResponse(400, { message: 'Missing keys' });
    
    await docClient.send(new DeleteCommand({ TableName: tableName, Key: { householdId, date_id } }));
    return buildResponse(200, { message: 'Expense deleted' });
  }

  return buildResponse(404, { message: 'Endpoint not found in expense controller' });
};