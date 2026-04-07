// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, Platform 
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { getJapaneseErrorMessage } from '../functions/authErrorHandler';
import { AuthInputForm } from '../components/auth/AuthInputForm';

export const LoginScreen = () => {
  const { 
    login, signUp, confirmSignUp, forgotPassword, confirmResetPassword, 
    authMode, setAuthMode, unconfirmedEmail, isLoading 
  } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    // 実行時にキーボードを確実に閉じる
    Keyboard.dismiss();
    
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
      Alert.alert('エラー', getJapaneseErrorMessage(error));
    }
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <Text style={styles.title}>節約帖</Text>
            <Text style={styles.subtitle}>家族みんなで、楽しくへそくり。</Text>
            
            <View style={styles.formContainer}>
              <AuthInputForm 
                authMode={authMode} email={email} setEmail={setEmail}
                password={password} setPassword={setPassword}
                newPassword={newPassword} setNewPassword={setNewPassword}
                code={code} setCode={setCode} unconfirmedEmail={unconfirmedEmail}
              />
              
              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{getButtonText()}</Text>}
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
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollContent: { flexGrow: 1 },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 40 },
  formContainer: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  primaryButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { marginTop: 24, alignItems: 'center' },
  toggleText: { color: '#007AFF', fontSize: 14, fontWeight: '500' },
  linkMargin: { marginBottom: 16 }
});