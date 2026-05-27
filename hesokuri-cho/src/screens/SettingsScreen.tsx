// src/screens/SettingsScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, SafeAreaView, Linking } from 'react-native';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { useHesokuriStore } from '../store';
import { CategoryList } from '../components/settings/CategoryList';
import { CategoryAddModal } from '../components/settings/CategoryAddModal';
import { FamilyMemberList } from '../components/settings/FamilyMemberList';
import { FamilyMemberAddModal } from '../components/settings/FamilyMemberAddModal';
import { FamilyMemberEditModal } from '../components/settings/FamilyMemberEditModal';
import { InputHistoryManagerModal } from '../components/settings/InputHistoryManagerModal';
import { GardenBuilderScreen } from '../components/garden/GardenBuilderScreen';
import { AdvancedSettingsSection } from '../components/settings/AdvancedSettingsSection';
import { SubscriptionPaywallModal } from '../components/subscription/SubscriptionPaywallModal'; // ▼ 新規追加
import { LEGAL_URLS } from '../constants';
import { useTheme } from '../hooks/useTheme'; // ▼ 新規追加: テーマ用フック
import { Colors } from '../constants/colors'; // ▼ 新規追加: カラー型のインポート

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme(); // ▼ 新規追加
  const styles = createStyles(colors); // ▼ 新規追加: 動的スタイル生成

  const { 
    pendingSettings, 
    setPendingSettings, 
    activeCategories, 
    hasChanges,
    modals, 
    modes, 
    actions 
  } = useSettingsManager();
  const { accountInfo } = useHesokuriStore();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("URLを開けませんでした", err));
  };

  if (modals.garden) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>お庭デバッグ検証</Text>
          <TouchableOpacity onPress={() => modals.setGarden(false)}>
            <Text style={styles.modalCloseText}>閉じる</Text>
          </TouchableOpacity>
        </View>
        <GardenBuilderScreen />
      </SafeAreaView>
    );
  }

  if (!pendingSettings) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerSideColumn} />
        <View style={styles.headerCenterColumn}>
          <Text style={styles.headerTitleText}>設定</Text>
        </View>
        <View style={styles.headerSideColumn}>
          <TouchableOpacity 
            onPress={actions.saveAll} 
            style={[styles.headerActionBtn, !hasChanges && { opacity: 0.3 }]}
            disabled={!hasChanges}
          >
            <Text style={styles.headerSubmitText}>保存</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 16 }} scrollEnabled={modes.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成</Text>
          <TouchableOpacity onPress={() => modes.setFamilyEdit(!modes.familyEdit)} style={[styles.actionBtn, modes.familyEdit && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, modes.familyEdit && styles.actionBtnTextActive]}>{modes.familyEdit ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>「≡」をタップしたままスライドして並び替えます。</Text>
        
        <FamilyMemberList 
          members={pendingSettings.familyMembers} 
          isReorderMode={modes.familyEdit}
          onUpdate={actions.updateFamily} 
          onDelete={actions.deleteFamily} 
          onAdd={() => modals.setFamilyAdd(true)} 
          onEditClick={modals.setFamilyEdit}
          onUpdateList={actions.updateFamilyList}
          onDragStart={() => modes.setScroll(false)}
          onDragEnd={() => modes.setScroll(true)}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏷️ カテゴリ管理</Text>
        </View>
        <View style={styles.marginWrapper}>
          <CategoryList 
            categories={activeCategories} 
            onDeleteCategory={actions.deleteCategory} 
            onAddCategory={() => modals.setCategory(true)} 
            onUpdateList={actions.updateCategoryList}
          />
        </View>

        <View style={styles.marginWrapper}>
          <AdvancedSettingsSection modals={modals} accountInfo={accountInfo} />
        </View>

        {/* 課金管理メニュー */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💎 プレミアムプラン</Text>
        </View>
        <View style={styles.marginWrapper}>
          <TouchableOpacity style={styles.legalButton} onPress={() => modals.setSubscription(true)}>
            <Text style={styles.legalText}>プランの購入・復元</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.legalSection}>
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.SUPPORT)} style={styles.legalButton}>
            <Text style={styles.legalText}>サポート・お問い合わせ</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.TERMS)} style={styles.legalButton}>
            <Text style={styles.legalText}>利用規約</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.PRIVACY)} style={styles.legalButton}>
            <Text style={styles.legalText}>プライバシーポリシー</Text>
          </TouchableOpacity>
          {/* 特商法表記リンク */}
          <TouchableOpacity onPress={() => openLink(LEGAL_URLS.COMMERCIAL_LAW)} style={styles.legalButton}>
            <Text style={styles.legalText}>特定商取引法に基づく表記</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CategoryAddModal visible={modals.category} onSave={actions.addCategory} onClose={() => modals.setCategory(false)} />
      <FamilyMemberAddModal visible={modals.familyAdd} onSave={actions.addFamily} onClose={() => modals.setFamilyAdd(false)} />
      <FamilyMemberEditModal member={modals.familyEdit} onSave={actions.updateFamily} onClose={() => modals.setFamilyEdit(null)} />
      
      <InputHistoryManagerModal 
        visible={modals.history} 
        settings={pendingSettings} 
        onUpdate={setPendingSettings} 
        onClose={() => modals.setHistory(false)} 
      />

      {/* ▼ 新規追加: サブスクリプション課金モーダル */}
      <SubscriptionPaywallModal 
        visible={modals.subscription} 
        onClose={() => modals.setSubscription(false)} 
      />
    </View>
  );
};

// ▼ 変更: colorsを引数に取るスタイル生成関数
const createStyles = (colors: Colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }, 
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 100 },
  headerSideColumn: { flex: 1 },
  headerCenterColumn: { flex: 2, alignItems: 'center' },
  headerActionBtn: { paddingVertical: 4 },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  headerSubmitText: { fontSize: 16, fontWeight: 'bold', color: colors.primary, textAlign: 'right' },
  marginWrapper: { marginHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.border, borderRadius: 8 },
  actionBtnActive: { backgroundColor: colors.primary },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: colors.textPrimary },
  actionBtnTextActive: { color: '#FFFFFF' }, // ※プライマリカラー上のテキストは白固定
  hintText: { fontSize: 12, color: colors.textSecondary, marginLeft: 16, marginBottom: 12, lineHeight: 18 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: colors.textPrimary },
  modalCloseText: { color: colors.primary, fontWeight: 'bold', fontSize: 16 },
  legalSection: { marginTop: 32, paddingHorizontal: 16, alignItems: 'center' },
  legalButton: { paddingVertical: 12, width: '100%', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 8, marginBottom: 8 },
  legalText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
});