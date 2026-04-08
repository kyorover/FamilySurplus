// src/stores/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand,
  ForgotPasswordCommand, // ▼ 追加: パスワードリセット要求用コマンド
  ConfirmForgotPasswordCommand // ▼ 追加: パスワードリセット確定用コマンド
} from "@aws-sdk/client-cognito-identity-provider";
import { useHesokuriStore } from '../store'; // ▼ 追加: ログアウト時の状態リセット用

const COGNITO_REGION = "ap-northeast-1"; 
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || "3sffgoev4ko2i12d7fa6pivahv"; 

const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

interface AuthState {
  authToken: string | null;
  authMode: 'LOGIN' | 'SIGNUP' | 'CONFIRM' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'; // ▼ 追加: パスワードリセット用のモード
  unconfirmedEmail: string | null;
  isLoading: boolean;
  error: string | null;
  setAuthMode: (mode: 'LOGIN' | 'SIGNUP' | 'CONFIRM' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD') => void;
  initAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>; // ▼ 追加: 関数定義
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>; // ▼ 追加: 関数定義
}

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  authMode: 'LOGIN',
  unconfirmedEmail: null,
  isLoading: false,
  error: null,

  setAuthMode: (mode) => set({ authMode: mode, error: null }),

  initAuth: async () => {
    const token = await SecureStore.getItemAsync('refreshToken');
    if (token) set({ authToken: token });
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const command = new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(), // ▼ 修正: スマホキーボード特有の末尾空白を自動削除
        Password: password,
      });
      await cognitoClient.send(command);
      set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  confirmSignUp: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(), // ▼ 修正: 空白除去
        ConfirmationCode: code.trim(),
      });
      await cognitoClient.send(command);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { USERNAME: email.trim(), PASSWORD: password }, // ▼ 修正: 空白除去による再ログインエラー防止
      });
      const response = await cognitoClient.send(command);
      const token = response.AuthenticationResult?.IdToken || null;
      const refreshToken = response.AuthenticationResult?.RefreshToken || null;

      if (token) {
        if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ authToken: token, isLoading: false });
      } else {
        throw new Error("認証トークンの取得に失敗しました");
      }
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
      } else {
        set({ error: err.message, isLoading: false });
      }
      throw err;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('refreshToken');
    set({ authToken: null, authMode: 'LOGIN', error: null });
    
    // ▼ 修正: ログアウト時にHesokuriStoreの残存キャッシュを初期化し、別アカウント再ログイン時のクラッシュを防止
    useHesokuriStore.getState().setPendingSettings(null);
    useHesokuriStore.setState({ settings: null, accountInfo: null, expenses: [], monthlyBudget: null });
  },

  // ▼ 新規追加: パスワードリセット要求処理
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const command = new ForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(),
      });
      await cognitoClient.send(command);
      set({ authMode: 'RESET_PASSWORD', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  // ▼ 新規追加: パスワードリセット確定処理
  confirmForgotPassword: async (email, code, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(),
        ConfirmationCode: code.trim(),
        Password: newPassword,
      });
      await cognitoClient.send(command);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  }
}));