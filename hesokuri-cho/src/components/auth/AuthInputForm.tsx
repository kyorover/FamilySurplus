// src/components/auth/AuthInputForm.tsx
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

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
}

export const AuthInputForm: React.FC<AuthInputFormProps> = (props) => {
  const {
    authMode, email, setEmail, password, setPassword,
    newPassword, setNewPassword, code, setCode, unconfirmedEmail
  } = props;

  if (authMode === 'CONFIRM') {
    return (
      <>
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          value={unconfirmedEmail || email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!unconfirmedEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="確認コード (6桁)"
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
          value={unconfirmedEmail || email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!unconfirmedEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="確認コード (6桁)"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="新しいパスワード"
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
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16 },
});