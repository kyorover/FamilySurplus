// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useHesokuriStore } from '../store';

export const LoginScreen = () => {
  // ※ store.ts に login 関数が実装される前提で呼び出します。
  const { login, isLoading } = useHesokuriStore() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }
    
    if (typeof login === 'function') {
      try {
        await login(email, password);
      } catch (error: any) {
        Alert.alert('ログイン失敗', error.message || 'ログインに失敗しました');
      }
    } else {
      Alert.alert('未実装', 'store.ts にログイン処理を実装してください。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>節約帖</Text>
      <Text style={styles.subtitle}>家族みんなで、楽しくへそくり。</Text>
      
      <View style={styles.formContainer}>
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
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>ログイン / 新規登録</Text>
          )}
        </TouchableOpacity>
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
  loginButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});