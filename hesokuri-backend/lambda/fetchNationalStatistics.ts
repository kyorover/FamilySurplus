// hesokuri-backend/lambda/fetchNationalStatistics.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

// フロントエンドと共有する統計データの型定義
export interface NationalStatistics {
  month: string;          // 例: "2023-10"
  cpi: number;            // 最新の消費者物価指数
  averageExpenses: {
    single: Record<string, number>; // 単身世帯の平均支出
    twoPerson: Record<string, number>; // 2人世帯の平均支出
    threePlus: Record<string, number>; // 3人以上世帯の平均支出
  };
  updatedAt: string;
}

// 外部API(e-Stat等)からのデータ取得をシミュレートするモック関数
async function fetchMockStatisticsData(targetMonth: string): Promise<NationalStatistics> {
  // 実際はここで Secrets Manager から APIキーを取得し、fetch 等で外部通信を行う
  // const secretsClient = new SecretsManagerClient({ region: "ap-northeast-1" });
  // ...
  
  return {
    month: targetMonth,
    cpi: 105.2,
    averageExpenses: {
      single: { food: 45000, utilities: 12000, daily: 5000 },
      twoPerson: { food: 70000, utilities: 18000, daily: 10000 },
      threePlus: { food: 95000, utilities: 25000, daily: 15000 },
    },
    updatedAt: new Date().toISOString()
  };
}

export const handler = async (event: any): Promise<{ statusCode: number, body: string }> => {
  try {
    console.log("FetchNationalStatisticsBatch started", JSON.stringify(event));
    
    const tableName = process.env.TABLE_NAME;
    if (!tableName) {
      throw new Error("TABLE_NAME environment variable is not set.");
    }

    // 対象月の決定（指定がなければ現在月）
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 1. 外部APIから統計データを取得（モック）
    const statisticsData = await fetchMockStatisticsData(currentMonth);

    // 2. DynamoDBへ保存（上書き）
    const putCommand = new PutCommand({
      TableName: tableName,
      Item: {
        PK: "CONFIG#STATISTICS",
        SK: `MONTH#${currentMonth}`,
        data: statisticsData,
        createdAt: new Date().toISOString(),
      }
    });

    await docClient.send(putCommand);
    console.log(`Successfully saved statistics for ${currentMonth}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Statistics successfully updated.", month: currentMonth })
    };

  } catch (error: any) {
    console.error("Error in FetchNationalStatisticsBatch:", error);
    // CloudWatchアラームやSNS通知の発火を期待し、エラーをスローする
    throw error;
  }
};