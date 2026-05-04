#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OidcStack } from '../lib/constructs/oidc-stack';

const app = new cdk.App();

const GITHUB_OWNER = 'kyorover';
// ↓実際のGitHubリポジトリ名（大文字・小文字）に正確に合わせてください
const GITHUB_REPO = 'FamilySurplus'; 

new OidcStack(app, 'SharedOidcSetupStack', {
  githubOwner: GITHUB_OWNER,
  githubRepo: GITHUB_REPO,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});