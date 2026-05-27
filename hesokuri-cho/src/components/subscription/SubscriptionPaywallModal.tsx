// src/components/subscription/SubscriptionPaywallModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { LEGAL_URLS } from '../../constants';
import { useTheme } from '../../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../../constants/colors'; // ▼ 新規追加: カラー型のインポート

interface SubscriptionPaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SubscriptionPaywallModal: React.FC<SubscriptionPaywallModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      fetchOfferings();
    }
  }, [visible]);

  const fetchOfferings = async () => {
    setIsLoading(true);
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages) {
        setPackages(offerings.current.availablePackages);
      }
    } catch (error: any) {
      Alert.alert('エラー', 'プラン情報の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('完了', 'プレミアムプランの購入が完了しました！');
        onClose();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('購入失敗', error.message || '決済処理中にエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('復元完了', 'プレミアムプランを復元しました。');
        onClose();
      } else {
        Alert.alert('情報', '有効な購入履歴が見つかりませんでした。');
      }
    } catch (error: any) {
      Alert.alert('復元失敗', '購入履歴の復元に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('エラー', 'リンクを開けませんでした。'));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaViewWrapper colors={colors}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>プレミアムプラン</Text>
          <TouchableOpacity onPress={onClose} disabled={isLoading}>
            <Text style={styles.closeText}>閉じる</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.featureBox}>
            <Text style={styles.featureTitle}>✨ プレミアム限定機能</Text>
            <Text style={styles.featureText}>• 広告の完全非表示</Text>
            <Text style={styles.featureText}>• 複数端末間でのリアルタイムデータ同期</Text>
            <Text style={styles.featureText}>• 高度なデータ分析・統計データのフル解放</Text>
          </View>

          {isLoading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}

          {!isLoading && packages.map((pkg) => (
            <TouchableOpacity key={pkg.identifier} style={styles.planButton} onPress={() => handlePurchase(pkg)}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{pkg.packageType === 'ANNUAL' ? '年額プラン' : '月額プラン'}</Text>
                <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
              </View>
              {pkg.packageType === 'ANNUAL' && <Text style={styles.badge}>お得</Text>}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={isLoading}>
            <Text style={styles.restoreText}>以前の購入を復元 (Restore)</Text>
          </TouchableOpacity>

          <Text style={styles.guidanceText}>
            ※サブスクリプションは自動的に更新されます。解約はiPhoneの設定画面（Apple ID アカウント設定 ＞ サブスクリプション）よりいつでも行うことができます。期間終了の24時間前までに解約を行ってください。
          </Text>

          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => openLink(LEGAL_URLS.TERMS)}><Text style={styles.linkText}>利用規約</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => openLink(LEGAL_URLS.PRIVACY)}><Text style={styles.linkText}>プライバシーポリシー</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => openLink(LEGAL_URLS.COMMERCIAL_LAW)}><Text style={styles.linkText}>特定商取引法に基づく表記</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaViewWrapper>
    </Modal>
  );
};

// ▼ 変更: ラッパーコンポーネントにcolorsを渡し、動的背景色を適用
const SafeAreaViewWrapper: React.FC<{ children: React.ReactNode; colors: Colors }> = ({ children, colors }) => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>
);

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  closeText: { fontSize: 16, color: colors.primary, fontWeight: 'bold' },
  scrollContent: { padding: 16 },
  featureBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  featureTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: colors.textPrimary },
  featureText: { fontSize: 14, color: colors.textPrimary, marginBottom: 6, lineHeight: 20 },
  loader: { marginVertical: 24 },
  planButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  planInfo: { flex: 1 },
  planName: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
  planPrice: { fontSize: 14, color: colors.textSecondary },
  badge: { backgroundColor: '#FF9500', color: '#FFFFFF', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, overflow: 'hidden' }, // ※バッジ色はアプリのアクセントとして固定
  restoreButton: { marginTop: 16, padding: 14, alignItems: 'center' },
  restoreText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
  guidanceText: { fontSize: 12, color: colors.textSecondary, marginTop: 24, paddingHorizontal: 8, lineHeight: 18, textAlign: 'justify' },
  linkContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24, marginBottom: 40 },
  linkText: { fontSize: 12, color: colors.primary, textDecorationLine: 'underline' }
});