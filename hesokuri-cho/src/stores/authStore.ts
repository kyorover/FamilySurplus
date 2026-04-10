// src/stores/authStore.ts
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getJapaneseErrorMessage } from '../functions/authErrorHandler';
import { cognitoAuthService } from '../services/cognitoAuthService';

// ▼ Require cycle 回避のためトップレベルの useHesokuriStore のインポートを削除

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
      const idToken = await cognitoAuthService.refreshToken(refreshToken);
      if (idToken) {
        set({ authToken: idToken });
        console.log("[Auth Trace] initAuth: Token refreshed successfully.");
      }
    } catch (err: any) {
      // ユーザー削除等による無効トークンはクラッシュさせず安全にログアウト処理
      if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
        console.log("[Auth Trace] initAuth: Token invalid or user deleted. Clearing token.");
      } else {
        // システムエラーの場合はログを残す
        console.log("[Auth Trace] initAuth error:", err.message);
      }
      await SecureStore.deleteItemAsync('refreshToken');
      set({ authToken: null });
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await cognitoAuthService.signUp(email, password);
      console.log(`[Auth Trace] signUp: ${email.trim()}`);
      set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      // 業務エラーとしてステートにセットし、例外を消化する
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
    }
  },

  confirmSignUp: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      await cognitoAuthService.confirmSignUp(email, code);
      console.log(`[Auth Trace] confirmSignUp: ${email.trim()}`);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, refreshToken } = await cognitoAuthService.login(email, password);

      if (token) {
        if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
        set({ authToken: token, isLoading: false });
        console.log("[Auth Trace] login: Success");
      } else {
        set({ error: "認証トークンの取得に失敗しました", isLoading: false });
      }
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        set({ authMode: 'CONFIRM', unconfirmedEmail: email.trim(), isLoading: false });
      } else {
        set({ error: getJapaneseErrorMessage(err), isLoading: false });
      }
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
      console.log("[Auth Trace] logout error:", err.message);
    }
  },

  // パスワードリセット要求処理
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await cognitoAuthService.forgotPassword(email);
      console.log(`[Auth Trace] forgotPassword: ${email.trim()}`);
      set({ authMode: 'RESET_PASSWORD', unconfirmedEmail: email.trim(), isLoading: false });
    } catch (err: any) {
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
    }
  },

  // パスワードリセット確定処理
  confirmForgotPassword: async (email, code, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await cognitoAuthService.confirmForgotPassword(email, code, newPassword);
      console.log(`[Auth Trace] confirmForgotPassword: ${email.trim()}`);
      set({ authMode: 'LOGIN', unconfirmedEmail: null, isLoading: false });
    } catch (err: any) {
      set({ error: getJapaneseErrorMessage(err), isLoading: false });
    }
  }
}));