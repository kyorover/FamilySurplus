// src/stores/authStore.ts
import { create } from 'zustand';
import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  InitiateAuthCommand 
} from "@aws-sdk/client-cognito-identity-provider";

// TODO: デプロイされたバックエンドの情報を設定してください
const COGNITO_REGION = "ap-northeast-1"; 
const COGNITO_CLIENT_ID = "3sffgoev4ko2i12d7fa6pivahv"; 

const cognitoClient = new CognitoIdentityProviderClient({ region: COGNITO_REGION });

interface AuthState {
  authToken: string | null;
  authMode: 'LOGIN' | 'SIGNUP' | 'CONFIRM';
  unconfirmedEmail: string | null;
  isLoading: boolean;
  error: string | null;
  setAuthMode: (mode: 'LOGIN' | 'SIGNUP' | 'CONFIRM') => void;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authToken: null,
  authMode: 'LOGIN',
  unconfirmedEmail: null,
  isLoading: false,
  error: null,

  setAuthMode: (mode) => set({ authMode: mode, error: null }),
  
  signUp: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const command = new SignUpCommand({
        ClientId: COGNITO_CLIENT_ID,
        Username: email,
        Password: password,
      });
      await cognitoClient.send(command);
      set({ authMode: 'CONFIRM', unconfirmedEmail: email, isLoading: false });
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
        Username: email,
        ConfirmationCode: code,
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
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });
      const response = await cognitoClient.send(command);
      const token = response.AuthenticationResult?.IdToken || null;
      if (token) {
        set({ authToken: token, isLoading: false });
      } else {
        throw new Error("認証トークンの取得に失敗しました");
      }
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        set({ authMode: 'CONFIRM', unconfirmedEmail: email, isLoading: false });
      } else {
        set({ error: err.message, isLoading: false });
      }
      throw err;
    }
  },

  logout: () => {
    set({ authToken: null });
  },
}));