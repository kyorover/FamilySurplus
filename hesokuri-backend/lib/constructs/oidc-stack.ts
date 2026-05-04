import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface OidcStackProps extends cdk.StackProps {
  githubOwner: string;
  githubRepo: string;
}

export class OidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: OidcStackProps) {
    super(scope, id, props);

    // 1. GitHub OIDC プロバイダの作成 (アカウント内で1つのみ)
    const githubProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // 2. 開発環境(dev)用の IAM ロール作成
    const devRole = new iam.Role(this, 'GitHubActionsDeployRole-dev', {
      roleName: 'GitHubActionsDeployRole-dev',
      description: 'Role assumed by GitHub Actions to deploy DEV environment',
      assumedBy: new iam.OpenIdConnectPrincipal(githubProvider).withConditions({
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${props.githubOwner}/${props.githubRepo}:*`,
        },
      }),
    });
    devRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    // 3. 本番環境(prod)用の IAM ロール作成
    const prodRole = new iam.Role(this, 'GitHubActionsDeployRole-prod', {
      roleName: 'GitHubActionsDeployRole-prod',
      description: 'Role assumed by GitHub Actions to deploy PROD environment',
      assumedBy: new iam.OpenIdConnectPrincipal(githubProvider).withConditions({
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${props.githubOwner}/${props.githubRepo}:*`,
        },
      }),
    });
    prodRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

    // 4. GitHub Secrets に登録するための Role ARN を出力
    new cdk.CfnOutput(this, 'DevRoleArnOutput', {
      value: devRole.roleArn,
      description: 'Register as AWS_ROLE_ARN_DEV in GitHub Secrets',
    });

    new cdk.CfnOutput(this, 'ProdRoleArnOutput', {
      value: prodRole.roleArn,
      description: 'Register as AWS_ROLE_ARN_PROD in GitHub Secrets',
    });
  }
}