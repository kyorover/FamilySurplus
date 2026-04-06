// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export const LoginScreen = () => {
  const { 
    login, signUp, confirmSignUp, authMode, setAuthMode, unconfirmedEmail, isLoading 
  } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    try {
      if (authMode === 'LOGIN') {
        if (!email || !password) return Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
        await login(email, password);
      } else if (authMode === 'SIGNUP') {
        if (!email || !password) return Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
        await signUp(email, password);
        Alert.alert('確認コード送信', 'メールアドレス宛に確認コードを送信しました。');
      } else if (authMode === 'CONFIRM') {
        const targetEmail = unconfirmedEmail || email;
        if (!targetEmail || !code) return Alert.alert('エラー', 'メールアドレスと確認コードを入力してください');
        await confirmSignUp(targetEmail, code);
        Alert.alert('登録完了', 'アカウントの認証が完了しました。ログインしてください。');
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || '処理に失敗しました');
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
            <Text style={styles.primaryButtonText}>
              {authMode === 'LOGIN' ? 'ログイン' : authMode === 'SIGNUP' ? '新規登録' : '認証する'}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.toggleContainer}>
          {authMode === 'LOGIN' ? (
            <TouchableOpacity onPress={() => setAuthMode('SIGNUP')} disabled={isLoading}>
              <Text style={styles.toggleText}>アカウントをお持ちでない方はこちら</Text>
            </TouchableOpacity>
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
  toggleText: { color: '#007AFF', fontSize: 14, fontWeight: '500' }
});