// src/screens/ForceUpdateScreen.tsx
import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Platform, Linking, Alert } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Colors } from '../constants/colors';

export const ForceUpdateScreen = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleOpenStore = async () => {
    // 【重要】実際のリリース時は、以下のURLを実際のApp IDおよびパッケージ名に変更してください。
    // app.config.ts や constants.ts で一元管理することを推奨します。
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/idXXXXXXXXXX' 
      : 'market://details?id=com.yourcompany.hesokuricho';

    try {
      const supported = await Linking.canOpenURL(storeUrl);
      if (supported) {
        await Linking.openURL(storeUrl);
      } else {
        Alert.alert('エラー', 'ストアを開くことができませんでした。');
      }
    } catch (error) {
      console.error('[ForceUpdateScreen] Failed to open store URL:', error);
      Alert.alert('エラー', '予期せぬエラーが発生しました。');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>アップデートのお知らせ</Text>
        
        <Text style={styles.subtitle}>
          最新バージョンのアプリが利用可能です。{'\n'}
          引き続きご利用いただくには、ストアからアップデートをお願いいたします。
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenStore}>
          <Text style={styles.primaryButtonText}>ストアを開く</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  innerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 32 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.textPrimary, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: colors.textSecondary, 
    marginBottom: 40, 
    textAlign: 'center', 
    lineHeight: 24 
  },
  primaryButton: { 
    backgroundColor: colors.primary, 
    paddingVertical: 16, 
    paddingHorizontal: 32, 
    borderRadius: 8, 
    alignItems: 'center', 
    width: '100%', 
    maxWidth: 300 
  },
  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});