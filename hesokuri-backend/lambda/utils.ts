// hesokuri-backend/lambda/utils.ts
import { APIGatewayProxyResult } from 'aws-lambda';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
};

/**
 * DynamoDBのエラー（ValidationException）を防ぐため、空文字プロパティを安全に削除する純粋関数
 */
export const removeEmptyStrings = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === '') {
      delete newObj[key];
    }
  });
  return newObj;
};

/**
 * API Gateway用の標準的なHTTPレスポンスを生成する関数
 */
export const buildResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
  return { 
    statusCode, 
    headers: corsHeaders, 
    body: JSON.stringify(body) 
  };
};