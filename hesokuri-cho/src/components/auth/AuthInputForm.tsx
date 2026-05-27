// src/components/auth/AuthInputForm.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { TermsAgreementUI } from './TermsAgreementUI';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface AuthInputFormProps {
  authMode: 'LOGIN' | 'SIGNUP' | 'CONFIRM' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  code: string;
  setCode: (val: string) => void;
  unconfirmedEmail: string | null;
  // 追加項目: 規約同意の状態と更新関数（SIGNUP時のみ使用）
  isAgreed?: boolean;
  setIsAgreed?: (val: boolean) => void;
}

export const AuthInputForm: React.FC<AuthInputFormProps> = (props) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const {
    authMode, email, setEmail, password, setPassword,
    newPassword, setNewPassword, code, setCode, unconfirmedEmail,
    isAgreed, setIsAgreed
  } = props;

  if (authMode === 'CONFIRM') {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor={colors.textSecondary} // ▼ 新規追加: ダークモード対応
          value={unconfirmedEmail || email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!unconfirmedEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="確認コード (6桁)"
          placeholderTextColor={colors.textSecondary} // ▼ 新規追加
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
      </>
    );
  }

  if (authMode === 'FORGOT_PASSWORD') {
    return (
      <TextInput
        style={styles.input}
        placeholder="登録済みメールアドレス"
        placeholderTextColor={colors.textSecondary} // ▼ 新規追加
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
    );
  }

  if (authMode === 'RESET_PASSWORD') {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor={colors.textSecondary} // ▼ 新規追加
          value={unconfirmedEmail || email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!unconfirmedEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="確認コード (6桁)"
          placeholderTextColor={colors.textSecondary} // ▼ 新規追加
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="新しいパスワード"
          placeholderTextColor={colors.textSecondary} // ▼ 新規追加
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
      </>
    );
  }

  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        placeholderTextColor={colors.textSecondary} // ▼ 新規追加
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        placeholderTextColor={colors.textSecondary} // ▼ 新規追加
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* 新規登録時のみ規約同意UIを表示 */}
      {authMode === 'SIGNUP' && isAgreed !== undefined && setIsAgreed !== undefined && (
        <TermsAgreementUI isAgreed={isAgreed} onValueChange={setIsAgreed} />
      )}
    </>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  input: { 
    backgroundColor: colors.background, // ▼ 変更
    color: colors.textPrimary, // ▼ 新規追加: ダークモード時の文字視認性確保
    padding: 16, 
    borderRadius: 8, 
    marginBottom: 16, 
    fontSize: 16 
  },
});