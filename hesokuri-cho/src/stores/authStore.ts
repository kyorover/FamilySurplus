// src/stores/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { getJapaneseErrorMessage } from '../functions/authErrorHandler';

// ▼ Require cycle 回避のためトップレベルの useHesokuriStore のインポートを削除

const COGNITO_REGION = "ap-northeast-1"; 
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || "3sffgoev4ko2i12d7fa6pivahv"; 

const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

interface AuthState {
  authToken: string | null;
  authMode: 'LOGIN' | 'SIGNUP' | 'CONFIRM' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';
  unconfirmedEmail: string | null;
  isLoading: boolean;
  error: string | null;
  setAuthMode: (mode: 'LOGIN' | 'SIGNUP' | 'CONFIRM' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD') => void;
  initAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  authMode: 'LOGIN',
  unconfirmedEmail: null,
  isLoading: false,
  error: null,

  setAuthMode: (mode) => set({ authMode: mode, error: null }),

  initAuth: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) return;
      const command = new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      });
      const response = await cognitoClient.send(command);
      if (response.AuthenticationResult?.IdToken) {
        set({ authToken: response.AuthenticationResult.IdToken });
        console.log("[Auth Trace] initAuth: Token refreshed successfully.");
      }
    } catch (err: any) {
      // ユーザー削除等による無効トークンはクラッシュさせず安全にログアウト処理
      if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
        console.log("[Auth Trace] initAuth: Token invalid or user deleted. Clearing token.");
      } else {
        console.error("[Auth Error - initAuth]", { name: err.name || err.code, msg: err.message });
      }
      await SecureStore.deleteItemAsync('refreshToken');
      set({ authToken: null });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const command = new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(),
        Password: password,
      });
      await cognitoClient.send(command);
      console.log(`[Auth Trace] signUp: ${email.trim()}`);
      set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      console.error("[Auth Error - signUp]", { name: err.name || err.code, msg: err.message });
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
      throw err;
    }
  },

  confirmSignUp: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(),
        ConfirmationCode: code.trim(),
      });
      await cognitoClient.send(command);
      console.log(`[Auth Trace] confirmSignUp: ${email.trim()}`);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      console.error("[Auth Error - confirmSignUp]", { name: err.name || err.code, msg: err.message });
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
      throw err;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: COGNITO_CLIENT_ID,
        AuthParameters: { USERNAME: email.trim(), PASSWORD: password },
      });
      const response = await cognitoClient.send(command);
      const token = response.AuthenticationResult?.IdToken || null;
      const refreshToken = response.AuthenticationResult?.RefreshToken || null;

      if (token) {
        if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ authToken: token, isLoading: false });
        console.log("[Auth Trace] login: Success");
      } else {
        throw new Error("認証トークンの取得に失敗しました");
      }
    } catch (err: any) {
      console.error("[Auth Error - login]", { name: err.name || err.code, msg: err.message });
      if (err.name === 'UserNotConfirmedException') {
        set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
      } else {
        set({ error: getJapaneseErrorMessage(err), isLoading: false });
      }
      throw err;
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync('refreshToken');
      set({ authToken: null, authMode: 'LOGIN', error: null });
      
      // Require cycleを回避するため、実行時に遅延ロード(動的インポート)する
      const { useHesokuriStore } = require('../store');
      useHesokuriStore.getState().setPendingSettings(null);
      // 幻覚(accountInfo)の残留を削除
      useHesokuriStore.setState({ settings: null, expenses: [], monthlyBudget: null });
      console.log("[Auth Trace] logout: Store cleared successfully");
    } catch (err: any) {
      console.error("[Auth Error - logout]", err);
    }
  },

  // パスワードリセット要求処理
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const command = new ForgotPasswordCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email.trim(),
      });
      await cognitoClient.send(command);
      console.log(`[Auth Trace] forgotPassword: ${email.trim()}`);
      set({ authMode: 'RESET_PASSWORD', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      console.error("[Auth Error - forgotPassword]", { name: err.name || err.code, msg: err.message });
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
      throw err;
    }
  },

  // パスワードリセット確定処理
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
      console.log(`[Auth Trace] confirmForgotPassword: ${email.trim()}`);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      console.error("[Auth Error - confirmForgotPassword]", { name: err.name || err.code, msg: err.message });
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
      throw err;
    }
  }
}));