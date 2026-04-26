#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HesokuriBackendStack } from '../lib/hesokuri-backend-stack';

const app = new cdk.App();

// CDKコンテキストから環境名を取得（デフォルトは 'dev'）
// デプロイ実行例: npx cdk deploy -c env=prod
const envName = app.node.tryGetContext('env') || 'dev';

// 環境名をサフィックスとして付与し、AWS上のスタックを物理的に分離する
const stackName = `HesokuriBackendStack-${envName}`;

new HesokuriBackendStack(app, stackName, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});