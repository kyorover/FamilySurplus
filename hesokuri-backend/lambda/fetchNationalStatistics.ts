// hesokuri-backend/lambda/fetchNationalStatistics.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
// import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

// フロントエンドと共有する統計データの型定義
export interface NationalStatistics {
  month: string;           // 例: "2026-04"
  cpi: number;             // 最新の消費者物価指数
  averageExpenses: {
    single: Record<string, number>; // 単身世帯の平均支出
    twoPerson: Record<string, number>; // 2人世帯の平均支出
    threePlus: Record<string, number>; // 3人以上世帯の平均支出
    /**
     * ▼ 修正：学齢別の固有加算コスト
     * 政府統計の世帯構成別データ差分から項目別に機械的に抽出した値。
     * バックエンドの演算結果を格納する構造。
     */
    additions?: {
      infant: Record<string, number>;    // 0-3歳(乳幼児)加算
      primary: Record<string, number>;   // 4-12歳(小学生)加算
      secondary: Record<string, number>; // 13-18歳(中高生)加算
    };
  };
  updatedAt: string;
}

/**
 * 統計ソース（e-Stat等）からの生データを比較し、
 * 特定の世帯構成に起因する各項目の増分（差分）を動的に算出する純粋な演算ロジック
 */
function calculateCostDelta(targetStats: Record<string, number>, baseStats: Record<string, number>): Record<string, number> {
  const categories = ['food', 'utilities', 'daily', 'clothing', 'medical', 'other'];
  const delta: Record<string, number> = {};

  categories.forEach(cat => {
    // [ターゲット世帯] - [ベース世帯] の差分を計算。負の値にならないよう 0 で丸める
    const targetVal = targetStats[cat] || 0;
    const baseVal = baseStats[cat] || 0;
    delta[cat] = Math.max(0, targetVal - baseVal);
  });

  return delta;
}

// 外部API(e-Stat等)からのデータ取得をシミュレートするモック関数
async function fetchMockStatisticsData(targetMonth: string): Promise<NationalStatistics> {
  // 実際はここで Secrets Manager から APIキーを取得し、fetch 等で外部通信を行う
  // const secretsClient = new SecretsManagerClient({ region: "ap-northeast-1" });
  // ...
  
  // 統計ソースから取得される想定の生データ（例：家計調査年報より）
  // これらの生データ自体も外部API連携時には動的に更新される
  const rawStats = {
    single: { food: 45000, utilities: 12000, daily: 5000 },
    twoPersonOnly: { food: 70000, utilities: 18000, daily: 10000, clothing: 5000, medical: 4000, other: 10000 },
    twoPersonWithInfant: { food: 82500, utilities: 19500, daily: 18400, clothing: 9100, medical: 7200, other: 12800 },
    twoPersonWithPrimary: { food: 95000, utilities: 21000, daily: 12000, clothing: 8000, medical: 5000, other: 15000 }, // ▼追加: 小学生モデル
    twoPersonWithSecondary: { food: 110000, utilities: 23000, daily: 14000, clothing: 12000, medical: 6000, other: 20000 }, // ▼追加: 中高生モデル
    threePlus: { food: 95000, utilities: 25000, daily: 15000 },
  };

  // ▼ 修正：汎用関数を用いて各学齢の差分（加算コスト）を算出
  const infantAdditions = calculateCostDelta(rawStats.twoPersonWithInfant, rawStats.twoPersonOnly);
  const primaryAdditions = calculateCostDelta(rawStats.twoPersonWithPrimary, rawStats.twoPersonOnly);
  const secondaryAdditions = calculateCostDelta(rawStats.twoPersonWithSecondary, rawStats.twoPersonOnly);

  return {
    month: targetMonth,
    cpi: 105.2,
    averageExpenses: {
      single: rawStats.single,
      twoPerson: rawStats.twoPersonOnly,
      threePlus: rawStats.threePlus,
      additions: {
        infant: infantAdditions,
        primary: primaryAdditions,
        secondary: secondaryAdditions
      } // 演算結果を格納
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