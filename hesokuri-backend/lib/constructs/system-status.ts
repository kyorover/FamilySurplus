// hesokuri-backend/lib/constructs/system-status.ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export interface SystemStatusConstructProps {
  api: apigateway.LambdaRestApi;
  envName: string;
}

export class SystemStatusConstruct extends Construct {
  constructor(scope: Construct, id: string, props: SystemStatusConstructProps) {
    super(scope, id);

    const envName = props.envName;

    // === アプリステータス検証用 Lambda 関数 ===
    const systemStatusHandler = new NodejsFunction(this, 'SystemStatusHandler', {
      functionName: `SystemStatusHandler-${envName}`,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../lambda/controllers/systemController.ts'),
      handler: 'handler',
      environment: {
        MIN_APP_VERSION: '1.0.0',
        LATEST_APP_VERSION: '1.0.0',
        IS_MAINTENANCE: 'false',
      },
      timeout: cdk.Duration.seconds(10),
    });

    // === API Gateway へのルート追加とCognito認可のバイパス設定 ===
    // アプリ起動時の未ログイン状態でもアクセス可能にするため、
    // /system/status エンドポイントのみ未認証（NONE）を開放します。
    
    // /system リソースの作成
    const systemResource = props.api.root.addResource('system');
    
    // /system/status リソースの作成とGETメソッドの追加
    systemResource.addResource('status').addMethod('GET', new apigateway.LambdaIntegration(systemStatusHandler), {
      authorizationType: apigateway.AuthorizationType.NONE,
    });
  }
}