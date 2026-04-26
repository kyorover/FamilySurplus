// src/components/dashboard/DashboardModals.tsx
import React from 'react';
import { CategoryDetailModal } from './CategoryDetailModal';
import { AllCategoryCalendarModal } from './AllCategoryCalendarModal';
import { MonthlyBudgetEditModal } from './MonthlyBudgetEditModal';
import { PocketMoneyRuleModal } from './PocketMoneyRuleModal';
import { MonthCheckoutModal } from './MonthCheckoutModal';

interface DashboardModalsProps {
  settings: any;
  monthlyBudget: any;
  activeCategories: any[];
  safeExpenses: any[];
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  isAllCalendarVisible: boolean;
  setAllCalendarVisible: (visible: boolean) => void;
  isBudgetModalVisible: boolean;
  setBudgetModalVisible: (visible: boolean) => void;
  isPocketMoneyModalVisible: boolean;
  setPocketMoneyModalVisible: (visible: boolean) => void;
  returnToCategoryDetail: any;
  returnToCategoryDetailDate: string | null;
  setReturnToCategoryDetail: (cat: any, date: any) => void;
  deleteExpense: (id: string) => Promise<void>;
  setExpenseInput: (input: any) => void;
  onNavigateToInput: () => void;
  guideline: number;
  updateMonthlyBudget: (b: any, ba: any, dr: any, mid: string) => Promise<void>;
  checkoutMonthId: string | null;
  isCheckoutVisible: boolean;
  budgetAmount: number;
  checkoutExpenses: any[];
  handleConfirmCheckout: () => Promise<void>;
  handleCancelCheckout: () => void;
}

export const DashboardModals: React.FC<DashboardModalsProps> = ({
  settings, monthlyBudget, activeCategories, safeExpenses,
  selectedCategoryId, setSelectedCategoryId,
  isAllCalendarVisible, setAllCalendarVisible,
  isBudgetModalVisible, setBudgetModalVisible,
  isPocketMoneyModalVisible, setPocketMoneyModalVisible,
  returnToCategoryDetail, returnToCategoryDetailDate, setReturnToCategoryDetail,
  deleteExpense, setExpenseInput, onNavigateToInput,
  guideline, updateMonthlyBudget,
  checkoutMonthId, isCheckoutVisible, budgetAmount, checkoutExpenses,
  handleConfirmCheckout, handleCancelCheckout
}) => {
  return (
    <>
      <CategoryDetailModal visible={!!selectedCategoryId} category={(settings.categories || []).find((c: any) => c.id === selectedCategoryId) || null} expenses={safeExpenses.filter(e => e.categoryId === selectedCategoryId)} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail !== 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setSelectedCategoryId(null); if (returnToCategoryDetail !== 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(c, d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: c, paymentMethod: '現金', storeName: '', memo: '', isLocked: true }); setReturnToCategoryDetail(c, d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: true }); setReturnToCategoryDetail(e.categoryId, e.date); onNavigateToInput(); }} />
      <AllCategoryCalendarModal visible={isAllCalendarVisible} categories={activeCategories} currentMonth={monthlyBudget.month_id} initialDate={returnToCategoryDetail === 'ALL' ? returnToCategoryDetailDate : null} onClose={() => { setAllCalendarVisible(false); if (returnToCategoryDetail === 'ALL') setReturnToCategoryDetail(null, null); }} onDelete={deleteExpense} onAddExpense={(d) => { setExpenseInput({ id: undefined, date: d, amount: '0', categoryId: '', paymentMethod: '現金', storeName: '', memo: '', isLocked: false }); setReturnToCategoryDetail('ALL', d); onNavigateToInput(); }} onEditExpense={(e) => { setExpenseInput({ id: e.id, date: e.date, amount: String(e.amount), categoryId: e.categoryId, paymentMethod: e.paymentMethod, storeName: e.storeName || '', memo: e.memo || '', isLocked: false }); setReturnToCategoryDetail('ALL', e.date); onNavigateToInput(); }} />
      <MonthlyBudgetEditModal visible={isBudgetModalVisible} categories={activeCategories} monthlyBudget={monthlyBudget} guideline={guideline} onSave={async (b) => { await updateMonthlyBudget(b, monthlyBudget.bonusAllocation, monthlyBudget.deficitRule, monthlyBudget.month_id); setBudgetModalVisible(false); }} onClose={() => setBudgetModalVisible(false)} />
      <PocketMoneyRuleModal visible={isPocketMoneyModalVisible} familyMembers={settings.familyMembers || []} monthlyBudget={monthlyBudget} onSave={async (a, r) => { await updateMonthlyBudget(monthlyBudget.budgets, a, r, monthlyBudget.month_id); setPocketMoneyModalVisible(false); }} onClose={() => setPocketMoneyModalVisible(false)} />
      {checkoutMonthId && <MonthCheckoutModal visible={isCheckoutVisible} monthId={checkoutMonthId} budgetAmount={budgetAmount} expenses={checkoutExpenses} onConfirm={handleConfirmCheckout} onCancel={handleCancelCheckout} />}
    </>
  );
};