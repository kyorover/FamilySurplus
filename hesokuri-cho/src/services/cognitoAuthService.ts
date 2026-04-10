// src/services/cognitoAuthService.ts
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";

const COGNITO_REGION = "ap-northeast-1"; 
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || "3sffgoev4ko2i12d7fa6pivahv"; 

// Cognitoクライアントの初期化
const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

export const cognitoAuthService = {
  /**
   * リフレッシュトークンを用いて新しいIDトークンを取得する
   */
  async refreshToken(refreshToken: string): Promise<string | null> {
    const command = new InitiateAuthCommand({
      AuthFlow: "REFRESH_TOKEN_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: { REFRESH_TOKEN: refreshToken },
    });
    const response = await cognitoClient.send(command);
    return response.AuthenticationResult?.IdToken || null;
  },

  /**
   * 新規ユーザー登録要求
   */
  async signUp(email: string, password: string): Promise<void> {
    const command = new SignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
      Password: password,
    });
    await cognitoClient.send(command);
  },

  /**
   * 新規ユーザー登録の確認（検証コード送信）
   */
  async confirmSignUp(email: string, code: string): Promise<void> {
    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
      ConfirmationCode: code.trim(),
    });
    await cognitoClient.send(command);
  },

  /**
   * ログイン（認証）処理
   */
  async login(email: string, password: string): Promise<{ token: string | null; refreshToken: string | null }> {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_CLIENT_ID,
      AuthParameters: { USERNAME: email.trim(), PASSWORD: password },
    });
    const response = await cognitoClient.send(command);
    return {
      token: response.AuthenticationResult?.IdToken || null,
      refreshToken: response.AuthenticationResult?.RefreshToken || null,
    };
  },

  /**
   * パスワードリセット要求
   */
  async forgotPassword(email: string): Promise<void> {
    const command = new ForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
    });
    await cognitoClient.send(command);
  },

  /**
   * パスワードリセットの確認（新パスワード設定）
   */
  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_CLIENT_ID,
      Username: email.trim(),
      ConfirmationCode: code.trim(),
      Password: newPassword,
    });
    await cognitoClient.send(command);
  }
};