// src/screens/SettingsScreen.tsx
import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Text, SafeAreaView } from 'react-native';
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

export const SettingsScreen: React.FC = () => {
  const { 
    pendingSettings, 
    activeCategories, 
    hasChanges,
    modals, 
    modes, 
    actions 
  } = useSettingsManager();
  const { accountInfo } = useHesokuriStore();

  if (modals.garden) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5' }]}>
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
        
        {/* 見出しと端（16px）を揃える */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>👨‍👩‍👦 家族構成</Text>
          <TouchableOpacity onPress={() => modes.setFamilyEdit(!modes.familyEdit)} style={[styles.actionBtn, modes.familyEdit && styles.actionBtnActive]}>
            <Text style={[styles.actionBtnText, modes.familyEdit && styles.actionBtnTextActive]}>{modes.familyEdit ? '✅ 完了' : '↕️ 並び替え'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.hintText}>「≡」をタップしたままスライドして並び替えます。</Text>
        
        {/* 内部マージン 16px を活用 */}
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
        {/* 自前マージンなし。Viewで包んで 16px を強制 */}
        <View style={styles.marginWrapper}>
          <CategoryList 
            categories={activeCategories} 
            onDeleteCategory={actions.deleteCategory} 
            onAddCategory={() => modals.setCategory(true)} 
            onUpdateList={actions.updateCategoryList}
          />
        </View>

        {/* 自前マージンなし。Viewで包んで 16px を強制 */}
        <View style={styles.marginWrapper}>
          <AdvancedSettingsSection modals={modals} accountInfo={accountInfo} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CategoryAddModal visible={modals.category} onSave={actions.addCategory} onClose={() => modals.setCategory(false)} />
      <FamilyMemberAddModal visible={modals.familyAdd} onSave={actions.addFamily} onClose={() => modals.setFamilyAdd(false)} />
      <FamilyMemberEditModal member={modals.familyEdit} onSave={actions.updateFamily} onClose={() => modals.setFamilyEdit(null)} />
      <InputHistoryManagerModal visible={modals.history} settings={pendingSettings} onUpdate={() => {}} onClose={() => modals.setHistory(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' }, 
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA', zIndex: 100 },
  headerSideColumn: { flex: 1 },
  headerCenterColumn: { flex: 2, alignItems: 'center' },
  headerActionBtn: { paddingVertical: 4 },
  headerTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  headerSubmitText: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', textAlign: 'right' },
  
  marginWrapper: { marginHorizontal: 16 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#F2F2F7', borderRadius: 8 },
  actionBtnActive: { backgroundColor: '#007AFF' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', color: '#1C1C1E' },
  actionBtnTextActive: { color: '#FFFFFF' },
  hintText: { fontSize: 12, color: '#8E8E93', marginLeft: 16, marginBottom: 12, lineHeight: 18 },
  
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  modalTitle: { fontSize: 16, fontWeight: 'bold' },
  modalCloseText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
});