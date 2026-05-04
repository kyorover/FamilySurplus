#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OidcStack } from '../lib/constructs/oidc-stack';

const app = new cdk.App();

// 連携対象のGitHubリポジトリ情報
const GITHUB_OWNER = 'kyorover';
const GITHUB_REPO = 'familysurplus';

// OIDCスタックは環境(dev/prod)に依存せず、共通基盤として1度だけデプロイします
new OidcStack(app, 'SharedOidcSetupStack', {
  githubOwner: GITHUB_OWNER,
  githubRepo: GITHUB_REPO,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});