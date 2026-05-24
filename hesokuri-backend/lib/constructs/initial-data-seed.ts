// hesokuri-backend/lib/constructs/initial-data-seed.ts
import { Construct } from 'constructs';
import * as customResources from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam'; // ▼ 新規追加: IAMポリシーを明示的に定義するため

export interface InitialDataSeedProps {
  targetFunction: lambda.IFunction;
}

export class InitialDataSeedConstruct extends Construct {
  constructor(scope: Construct, id: string, props: InitialDataSeedProps) {
    super(scope, id);

    // デプロイ完了時に指定されたLambda関数を1度だけ自動実行するカスタムリソース
    new customResources.AwsCustomResource(this, 'TriggerFetchStatisticsBatch', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: props.targetFunction.functionName,
          // バッチの完了を待たずにデプロイを正常終了させるため、非同期(Event)で呼び出す
          InvocationType: 'Event', 
        },
        // リソースの初回作成時（onCreate）にのみ発火させるための固定ID
        physicalResourceId: customResources.PhysicalResourceId.of('InitialDataSeedTrigger'),
      },
      // ▼ 変更: fromSdkCallsによる自動推論をやめ、明示的にInvoke権限を付与する
      policy: customResources.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [props.targetFunction.functionArn],
        }),
      ]),
    });
  }
}