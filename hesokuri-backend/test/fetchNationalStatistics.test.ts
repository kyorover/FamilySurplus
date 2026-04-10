// hesokuri-backend/test/fetchNationalStatistics.test.ts
import { handler } from '../lambda/fetchNationalStatistics';
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// AWS SDK のモック
jest.mock("@aws-sdk/lib-dynamodb", () => {
  const original = jest.requireActual("@aws-sdk/lib-dynamodb");
  return {
    ...original,
    DynamoDBDocumentClient: {
      from: jest.fn().mockReturnValue({
        send: jest.fn().mockResolvedValue({}),
      }),
    },
  };
});

describe('FetchNationalStatisticsBatch Lambda', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, TABLE_NAME: 'MockSystemConfigTable' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should fetch mock data and save it to DynamoDB successfully', async () => {
    const result = await handler({});
    
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('message', 'Statistics successfully updated.');
    
    // DynamoDBのモッククライアントが呼ばれたか確認
    const docClient = DynamoDBDocumentClient.from({} as any);
    expect(docClient.send).toHaveBeenCalledTimes(1);
    
    const callArgs = (docClient.send as jest.Mock).mock.calls[0][0];
    expect(callArgs).toBeInstanceOf(PutCommand);
    expect(callArgs.input.TableName).toBe('MockSystemConfigTable');
    expect(callArgs.input.Item.PK).toBe('CONFIG#STATISTICS');
    expect(callArgs.input.Item.data).toHaveProperty('cpi');
    expect(callArgs.input.Item.data).not.toHaveProperty('income'); // 収入が含まれていないことをテスト
  });

  it('should throw an error if TABLE_NAME is not set', async () => {
    delete process.env.TABLE_NAME;
    await expect(handler({})).rejects.toThrow('TABLE_NAME environment variable is not set.');
  });
});