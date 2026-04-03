// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';
import { useHesokuriStore } from '../store';
import { BudgetProgressBar } from '../components/dashboard/BudgetProgressBar';
import { CategoryDetailModal } from '../components/dashboard/CategoryDetailModal';
import { AllCategoryCalendarModal } from '../components/dashboard/AllCategoryCalendarModal';
import { MonthlyBudgetEditModal } from '../components/dashboard/MonthlyBudgetEditModal';
import { PocketMoneyRuleModal } from '../components/dashboard/PocketMoneyRuleModal';
import { calculateAverageGuideline, evaluateBudget } from '../functions/budgetUtils';
import { MonthlyBudget, Category } from '../types';
import { DEFAULT_CATEGORY_NAMES } from '../constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface DashboardScreenProps {
  onNavigateToHesokuriHistory: () => void;
  onNavigateToInput: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateToHesokuriHistory, onNavigateToInput }) => {
  const {
    settings, expenses, monthlyBudget,
    updateSettings, updateMonthlyBudget, deleteExpense,
    setExpenseInput, returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail,
    waterGarden
  } = useHesokuriStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAllCalendarVisible, setAllCalendarVisible] = useState(false);
  const [isBudgetModalVisible, setBudgetModalVisible] = useState(false);
  const [isPocketMoneyModalVisible, setPocketMoneyModalVisible] = useState(false);
  const [isSettingsMenuVisible, setSettingsMenuVisible] = useState(false); // 新規：設定メニューモーダル

  const [isEditMode, setIsEditMode] = useState(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  useEffect(() => {
    if (returnToCategoryDetail === 'ALL') setAllCalendarVisible(true);
    else if (returnToCategoryDetail) setSelectedCategoryId(returnToCategoryDetail);
  }, [returnToCategoryDetail]);

  const activeCategories = useMemo(() => {
    if (!settings) return [];
    const hasChild = settings.familyMembers.some(m => m.role === '子供');
    return settings.categories.filter(cat => cat.isFixed && cat.name === DEFAULT_CATEGORY_NAMES.CHILD_CARE ? hasChild : true);
  }, [settings]);

  if (!settings || !monthlyBudget) return null;

  const hasChild = settings.familyMembers.some(m => m.role === '子供');
  const targetCategories = activeCategories.filter(cat => cat.isFixed || cat.isCalculationTarget !== false);
  const targetCategoryIds = new Set(targetCategories.map(c => c.id));
  const totalMonthlyBudget = targetCategories.reduce((sum, cat) => sum + (monthlyBudget.budgets[cat.id] || 0), 0);
  const totalSpent = expenses.filter(exp => targetCategoryIds.has(exp.categoryId)).reduce((sum, exp) => sum + exp.amount, 0);
  const currentHesokuri = totalMonthlyBudget - totalSpent;

  // 年月表示用のフォーマット（例: 2024年7月）
  const [year, month] = monthlyBudget.month_id.split('-');
  const displayMonth = `${year}年${parseInt(month)}月`;

  const spentByCategory = expenses.reduce((acc, exp) => { acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount; return acc; }, {} as Record<string, number>);

  const handleSaveMonthlyBudget = async (newBudgets: Record<string, number>) => {
    await updateMonthlyBudget(newBudgets, monthlyBudget.bonusAllocation, monthlyBudget.deficitRule, monthlyBudget.month_id);
    setBudgetModalVisible(false);
  };

  const handleSavePocketMoneyRules = async (newAllocation: Record<string, number>, newRule: MonthlyBudget['deficitRule']) => {
    await updateMonthlyBudget(monthlyBudget.budgets, newAllocation, newRule, monthlyBudget.month_id);
    setPocketMoneyModalVisible(false);
  };

  const handleReorderCategories = async (fromIndex: number, toIndex: number) => {
    const newCategories = [...settings.categories];
    const itemToMove = activeCategories[fromIndex];
    const targetItem = activeCategories[toIndex];
    const fullFromIdx = newCategories.findIndex(c => c.id === itemToMove.id);
    const fullToIdx = newCategories.findIndex(c => c.id === targetItem.id);
    const [removed] = newCategories.splice(fullFromIdx, 1);
    newCategories.splice(fullToIdx, 0, removed);
    await updateSettings({ ...settings, categories: newCategories });
  };

  const renderCategoryItem = ({ item: cat, onDragStart, onDragEnd, isActive }: DragListRenderItemInfo<Category>) => (
    <View style={[styles.dragRow, isActive && styles.dragRowActive]}>
      <TouchableOpacity activeOpacity={0.6} onPressIn={onDragStart} onPressOut={onDragEnd} style={styles.dragHandle}>
        <Text style={[styles.dragIcon, isActive && { color: '#007AFF' }]}>≡</Text>
      </TouchableOpacity>
      <View style={styles.progressWrap} pointerEvents="none">
        <BudgetProgressBar categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} isCalculationTarget={cat.isCalculationTarget} onPressDetail={() => {}} />
      </View>
    </View>
  );

  const selectedCategoryForDetail = settings.categories.find(c => c.id === selectedCategoryId) || null;
  const selectedExpenses = expenses.filter(e => e.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date));

  const todayStr = new Date().toISOString().slice(0, 10);
  const isWateredToday = settings.lastWateringDate === todayStr;

  // 進行度の計算（0~1）
  const progressRatio = totalMonthlyBudget > 0 ? Math.min(1, totalSpent / totalMonthlyBudget) : 0;
  const progressColor = currentHesokuri >= 0 ? '#34C759' : '#FF3B30'; // プラスなら緑、マイナスなら赤

  return (
    <View style={styles.container}>
      {/* ヘッダーエリア */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{displayMonth}の予算</Text>
        <TouchableOpacity onPress={() => setSettingsMenuVisible(true)} style={styles.iconBtn}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} scrollEnabled={isScrollEnabled} showsVerticalScrollIndicator={false}>
        
        {/* 新規：家計ステータスカード（全てのサマリーを集約） */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => setAllCalendarVisible(true)} style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardSubTitle}>総へそくり残高</Text>
              <Text style={styles.cardTotalAmount}>¥{(settings.gardenPoints || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.wateringBadge}>
              <Text style={styles.wateringPoints}>{settings.gardenPoints || 0} pt</Text>
              <TouchableOpacity onPress={waterGarden} disabled={isWateredToday} style={[styles.wateringBtn, isWateredToday && styles.wateringBtnDisabled]}>
                <Text style={styles.wateringBtnText}>{isWateredToday ? '🌿 完了' : '💧 水やり'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardBody}>
            <View style={styles.monthStatusHeader}>
              <Text style={styles.cardSubTitle}>今月のへそくり進捗</Text>
              <Text style={[styles.cardMonthAmount, { color: progressColor }]}>
                {currentHesokuri >= 0 ? '+' : ''}{currentHesokuri.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.mainProgressBarTrack}>
              <View style={[styles.mainProgressBarFill, { width: `${progressRatio * 100}%`, backgroundColor: progressColor }]} />
            </View>
            
            <View style={styles.mainProgressLabel}>
              <Text style={styles.progressLabelText}>支出 ¥{totalSpent.toLocaleString()}</Text>
              <Text style={styles.progressLabelText}>予算 ¥{totalMonthlyBudget.toLocaleString()}</Text>
            </View>
          </View>
          
          <Text style={styles.cardFooterText}>👉 タップでカレンダー・履歴を確認</Text>
        </TouchableOpacity>

        {/* カテゴリ別詳細エリア */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>カテゴリ別内訳</Text>
            {isEditMode && (
              <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsEditMode(false); }} style={styles.compactBtnActive}>
                <Text style={styles.compactBtnTextActive}>✅ 完了</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            <DragList data={activeCategories} keyExtractor={(item) => item.id} onReordered={handleReorderCategories} renderItem={renderCategoryItem} onDragBegin={() => setIsScrollEnabled(false)} onDragEnd={() => setIsScrollEnabled(true)} scrollEnabled={false} />
          ) : (
            <View>
              {activeCategories.map(cat => (
                <View key={cat.id} style={styles.viewRow}>
                  <View style={styles.progressWrap}>
                    <BudgetProgressBar categoryId={cat.id} categoryName={cat.name} budget={monthlyBudget.budgets[cat.id] || 0} spent={spentByCategory[cat.id] || 0} isCalculationTarget={cat.isCalculationTarget} onPressDetail={setSelectedCategoryId} />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* 新規：支出入力FAB */}
      {!isEditMode && (
        <TouchableOpacity onPress={onNavigateToInput} style={styles.fab}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}

      {/* 新規：設定メニューモーダル（アクションシート風） */}
      <Modal visible={isSettingsMenuVisible} transparent animationType="slide" onRequestClose={() => setSettingsMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setSettingsMenuVisible(false)}>
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>設定・管理</Text>
              <TouchableOpacity onPress={() => setSettingsMenuVisible(false)}><Text style={styles.menuCloseBtn}>✕</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); setBudgetModalVisible(true); }}>
              <Text style={styles.menuItemIcon}>📊</Text><Text style={styles.menuItemText}>今月の予算を編成</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); setPocketMoneyModalVisible(true); }}>
              <Text style={styles.menuItemIcon}>💰</Text><Text style={styles.menuItemText}>お小遣いルールを設定</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); onNavigateToHesokuriHistory(); }}>
              <Text style={styles.menuItemIcon}>📈</Text><Text style={styles.menuItemText}>過去のへそくり履歴</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => { setSettingsMenuVisible(false); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsEditMode(true); }}>
              <Text style={styles.menuItemIcon}>↕️</Text><Text style={styles.menuItemText}>カテゴリを並び替え</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* 既存モーダル群 */}
      <CategoryDetailModal visible={!!selectedCategoryId} category={selectedCategoryForDetail} expenses={selectedExpenses} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(categoryId, date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(categoryId, date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: true }); setReturnToCategoryDetail(exp.categoryId, exp.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(date) => { setExpenseInput({ id: undefined, date, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', date); onNavigateToInput(); }} onEditExpense={(exp) => { setExpenseInput({ id: exp.id, date: exp.date, amount: String(exp.amount), categoryId: exp.categoryId, paymentMethod: exp.paymentMethod, storeName: exp.storeName || '', memo: exp.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', exp.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={calculateAverageGuideline(settings.familyMembers)} onSave={handleSaveMonthlyBudget} onClose={() => setBudgetModalVisible(false)} />
      <PocketMoneyRuleModal visible={isPocketMoneyModalVisible} familyMembers={settings.familyMembers} monthlyBudget={monthlyBudget} onSave={handleSavePocketMoneyRules} onClose={() => setPocketMoneyModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 16, paddingBottom: 16, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
  iconBtn: { padding: 8 },
  iconText: { fontSize: 20 },
  
  // ステータスカード
  statusCard: { backgroundColor: '#FFFFFF', margin: 16, padding: 20, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardSubTitle: { fontSize: 12, color: '#8E8E93', fontWeight: '600', marginBottom: 4 },
  cardTotalAmount: { fontSize: 28, fontWeight: 'bold', color: '#1C1C1E' },
  wateringBadge: { alignItems: 'center', backgroundColor: '#F2F2F7', padding: 8, borderRadius: 16 },
  wateringPoints: { fontSize: 14, fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  wateringBtn: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  wateringBtnDisabled: { backgroundColor: '#C7C7CC' },
  wateringBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  cardDivider: { height: 1, backgroundColor: '#E5E5EA', marginBottom: 16 },
  cardBody: { marginBottom: 12 },
  monthStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  cardMonthAmount: { fontSize: 18, fontWeight: 'bold' },
  mainProgressBarTrack: { height: 12, backgroundColor: '#E5E5EA', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  mainProgressBarFill: { height: '100%', borderRadius: 6 },
  mainProgressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabelText: { fontSize: 11, color: '#8E8E93' },
  cardFooterText: { fontSize: 12, color: '#007AFF', textAlign: 'center', fontWeight: '600', marginTop: 8 },

  // カテゴリリスト
  listSection: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingTop: 24, paddingBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1C1C1E' },
  compactBtnActive: { backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  compactBtnTextActive: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  viewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  dragRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 4 },
  dragRowActive: { backgroundColor: '#F0F8FF', zIndex: 999, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  dragHandle: { paddingLeft: 24, paddingRight: 8, paddingVertical: 16, justifyContent: 'center' },
  dragIcon: { fontSize: 24, color: '#C7C7CC', fontWeight: '300' },
  progressWrap: { flex: 1, paddingHorizontal: 16 },

  // FAB
  fab: { position: 'absolute', right: 24, bottom: 24, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 8 },
  fabText: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', marginTop: -2 },

  // 設定メニュー（アクションシート）
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  menuContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#1C1C1E' },
  menuCloseBtn: { fontSize: 20, color: '#8E8E93', padding: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuItemIcon: { fontSize: 20, marginRight: 16, width: 24, textAlign: 'center' },
  menuItemText: { fontSize: 16, color: '#1C1C1E', fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 8 },
});