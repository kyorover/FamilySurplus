// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';

// === 追加: AWS Cognitoのエラーを日本語に変換するヘルパー関数 ===
const getJapaneseErrorMessage = (error: any): string => {
  const code = error.name || error.code;
  
  if (code === 'InvalidPasswordException' || (error.message && error.message.includes('Password did not conform'))) {
    return 'パスワードの強度が不足しています。\n8文字以上で、大文字・小文字・数字・特殊記号（!@#$等）を含めてください。';
  }
  if (code === 'UsernameExistsException') return 'このメールアドレスは既に登録されています。';
  if (code === 'UserNotFoundException') return '登録されていないメールアドレスです。';
  if (code === 'NotAuthorizedException') return 'メールアドレスまたはパスワードが間違っています。';
  if (code === 'CodeMismatchException') return '確認コードが間違っています。';
  if (code === 'ExpiredCodeException') return '確認コードの有効期限が切れています。再度登録からやり直してください。';
  if (code === 'TooManyRequestsException' || code === 'LimitExceededException') {
    return '試行回数が多すぎます。しばらく時間をおいてから再度お試しください。';
  }
  if (code === 'InvalidParameterException' && error.message?.includes('email')) {
    return 'メールアドレスの形式が正しくありません。';
  }
  
  return 'エラーが発生しました。入力内容をご確認ください。';
};
// =========================================================

export const LoginScreen = () => {
  const { 
    login, signUp, confirmSignUp, forgotPassword, confirmResetPassword, 
    authMode, setAuthMode, unconfirmedEmail, isLoading 
  } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState(''); // パスワードリセット用
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    try {
      if (authMode === 'LOGIN') {
        if (!email || !password) return Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
        await login(email, password);
      } else if (authMode === 'SIGNUP') {
        if (!email || !password) return Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください');
        await signUp(email, password);
        Alert.alert('確認コード送信', 'ご入力いただいたメールアドレス宛に、6桁の確認コードを送信しました。');
      } else if (authMode === 'CONFIRM') {
        const targetEmail = unconfirmedEmail || email;
        if (!targetEmail || !code) return Alert.alert('入力エラー', 'メールアドレスと確認コードを入力してください');
        await confirmSignUp(targetEmail, code);
        Alert.alert('登録完了', 'アカウントの認証が完了しました。ログインしてください。');
      } else if (authMode === 'FORGOT_PASSWORD') {
        if (!email) return Alert.alert('入力エラー', 'メールアドレスを入力してください');
        await forgotPassword(email);
        Alert.alert('リセットコード送信', 'パスワード再設定用の確認コードをメールで送信しました。');
      } else if (authMode === 'RESET_PASSWORD') {
        const targetEmail = unconfirmedEmail || email;
        if (!targetEmail || !code || !newPassword) return Alert.alert('入力エラー', 'すべての項目を入力してください');
        await confirmResetPassword(targetEmail, code, newPassword);
        Alert.alert('再設定完了', 'パスワードの再設定が完了しました。新しいパスワードでログインしてください。');
      }
    } catch (error: any) {
      // ▼ 修正: 英語エラーをそのまま出さず、日本語に翻訳して表示する
      Alert.alert('エラー', getJapaneseErrorMessage(error));
    }
  };

  const renderInputs = () => {
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

  const getButtonText = () => {
    switch (authMode) {
      case 'LOGIN': return 'ログイン';
      case 'SIGNUP': return '新規登録';
      case 'CONFIRM': return '認証する';
      case 'FORGOT_PASSWORD': return 'コードを送信';
      case 'RESET_PASSWORD': return '再設定する';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>節約帖</Text>
      <Text style={styles.subtitle}>家族みんなで、楽しくへそくり。</Text>
      
      <View style={styles.formContainer}>
        {renderInputs()}
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{getButtonText()}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          {authMode === 'LOGIN' ? (
            <>
              <TouchableOpacity onPress={() => setAuthMode('SIGNUP')} disabled={isLoading} style={styles.linkMargin}>
                <Text style={styles.toggleText}>アカウントをお持ちでない方はこちら</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAuthMode('FORGOT_PASSWORD')} disabled={isLoading}>
                <Text style={styles.toggleText}>パスワードを忘れた場合はこちら</Text>
              </TouchableOpacity>
            </>
          ) : authMode === 'SIGNUP' ? (
            <TouchableOpacity onPress={() => setAuthMode('LOGIN')} disabled={isLoading}>
              <Text style={styles.toggleText}>既にアカウントをお持ちの方はこちら</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setAuthMode('LOGIN')} disabled={isLoading}>
              <Text style={styles.toggleText}>ログイン画面に戻る</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 40 },
  formContainer: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  input: { backgroundColor: '#F2F2F7', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  linkMargin: { marginBottom: 16 }
});