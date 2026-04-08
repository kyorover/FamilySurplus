// hesokuri-backend/lambda/postConfirmation.ts
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME || '';

export const handler = async (event: PostConfirmationTriggerEvent): Promise<PostConfirmationTriggerEvent> => {
  console.log('PostConfirmation Event:', JSON.stringify(event, null, 2));

  // Cognitoから渡されるユーザー属性を取得
  const userAttributes = event.request.userAttributes;
  const sub = userAttributes.sub;     // Cognitoの一意なユーザーID
  const email = userAttributes.email; // 登録されたメールアドレス

  if (sub && email) {
    const now = new Date().toISOString();
    
    // アカウントの初期データ
    const item = {
      accountId: sub, // PK: Cognitoのsubと一致させる
      email: email,
      subscriptionPlan: 'FREE', // 初期プラン
      createdAt: now,
      isAdmin: false, // ▼ 追加: 新規登録時はデフォルトで false を明示的にセットする
    };

    try {
      await docClient.send(new PutCommand({
        TableName: ACCOUNTS_TABLE,
        Item: item,
      }));
      console.log('Successfully created account record in DynamoDB:', item);
    } catch (error) {
      console.error('Error creating account record:', error);
      // エラーが発生しても、Cognitoのサインアップ自体をブロックしないようにスローしない
    }
  }

  return event;
};