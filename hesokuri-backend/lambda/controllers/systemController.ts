// hesokuri-backend/lambda/controllers/systemController.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from '../utils';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path } = event;
  const normalizedPath = path.replace(/\/$/, '');

  // === GET /system/status : アプリステータスの取得 ===
  if (httpMethod === 'GET' && normalizedPath === '/system/status') {
    // インフラ(CDK)の環境変数から設定値を取得。未設定時のフォールバックも定義。
    const minAppVersion = process.env.MIN_APP_VERSION || '1.0.0';
    const latestAppVersion = process.env.LATEST_APP_VERSION || '1.0.0';
    // 'true' 文字列と厳密比較し、boolean型として返却する
    const isMaintenance = process.env.IS_MAINTENANCE === 'true';

    return buildResponse(200, {
      minAppVersion,
      latestAppVersion,
      isMaintenance
    });
  }

  // 想定外のルートが呼び出された場合のフォールバック
  return buildResponse(404, { message: 'Not Found' });
};