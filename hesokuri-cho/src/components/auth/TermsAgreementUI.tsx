// src/components/auth/TermsAgreementUI.tsx
import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LEGAL_URLS } from '../../constants';

interface TermsAgreementUIProps {
  isAgreed: boolean;
  onValueChange: (value: boolean) => void;
}

/**
 * 新規登録時の規約同意UI
 * 利用規約およびプライバシーポリシーへの同意スイッチとリンクを提供します。
 */
export const TermsAgreementUI: React.FC<TermsAgreementUIProps> = ({ 
  isAgreed, 
  onValueChange 
}) => {
  // 外部リンクを開く処理
  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => 
      console.error("URLを開けませんでした", err)
    );
  };

  return (
    <View style={styles.container}>
      <Switch
        value={isAgreed}
        onValueChange={onValueChange}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isAgreed ? "#2196F3" : "#f4f3f4"}
      />
      <View style={styles.textContainer}>
        <View style={styles.linkRow}>
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.TERMS)}>
            <Text style={styles.linkText}>利用規約</Text>
          </TouchableOpacity>
          <Text style={styles.plainText}> および </Text>
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.PRIVACY)}>
            <Text style={styles.linkText}>プライバシーポリシー</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.plainText}>に同意する</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  plainText: {
    fontSize: 13,
    color: '#333',
  },
  linkText: {
    fontSize: 13,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});