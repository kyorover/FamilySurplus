// lambda/controllers/webhookController.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// DB仕様に基づき、AccountsTableを更新対象とする
const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME || '';

export const handleWebhook = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    // セキュリティ: RevenueCat側で設定したAuthorizationヘッダーの検証
    const authHeader = event.headers['Authorization'] || event.headers['authorization'];
    const expectedToken = process.env.REVENUECAT_WEBHOOK_AUTH_TOKEN;
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.warn('Unauthorized webhook request attempt');
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    const payload = JSON.parse(event.body);
    const revenueCatEvent = payload.event;

    if (!revenueCatEvent || !revenueCatEvent.app_user_id) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Invalid payload structure' }) };
    }

    const { app_user_id, type, entitlement_ids, expiration_at_ms } = revenueCatEvent;

    // 'premium' 権限に対するイベントかどうか
    const isPremium = entitlement_ids && entitlement_ids.includes('premium');
    
    // DB仕様書・型定義に準拠したステータス ('FREE' | 'PREMIUM')
    let newSubscriptionPlan = 'FREE';
    let shouldUpdate = false;

    // イベントタイプによるプラン状態の判定
    switch (type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION':
        if (isPremium) {
          newSubscriptionPlan = 'PREMIUM';
          shouldUpdate = true;
        }
        break;
      case 'EXPIRATION':
        // 有効期限切れで無料プランへ降格
        newSubscriptionPlan = 'FREE';
        shouldUpdate = true;
        break;
      case 'CANCELLATION':
        // CANCELLATIONは「自動更新の停止」であり、期間中は有効なため即時降格はしない
        return { statusCode: 200, body: JSON.stringify({ message: 'Cancellation recorded, waiting for expiration.' }) };
      default:
        // その他のイベントはスキップ
        return { statusCode: 200, body: JSON.stringify({ message: 'Event ignored' }) };
    }

    if (shouldUpdate) {
      // 有効期限をISO文字列に変換 (無い場合はnull)
      const expiresAtIso = expiration_at_ms ? new Date(expiration_at_ms).toISOString() : null;

      // DynamoDBのAccountsTableを更新 (PK: accountId)
      const updateParams = {
        TableName: ACCOUNTS_TABLE,
        Key: { accountId: app_user_id },
        UpdateExpression: 'SET subscriptionPlan = :plan, subscriptionExpiry = :expiry',
        ExpressionAttributeValues: {
          ':plan': newSubscriptionPlan,
          ':expiry': expiresAtIso
        }
      };

      await docClient.send(new UpdateCommand(updateParams));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully' })
    };
  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};