import type { CashFlowCategory, ChartOfAccount, NormalBalance, StatementType } from "@/types/erp";

export interface AccountClassification {
  statementType: StatementType;
  statementSection: string;
  normalBalance: NormalBalance;
  cashFlowCategory: CashFlowCategory;
}

export const balanceSheetSections = [
  ["current-assets", "أصول متداولة"], ["cash", "نقدية"], ["banks", "بنوك"],
  ["non-current-assets", "أصول غير متداولة"], ["contra-assets", "حساب مقابل للأصول"],
  ["current-liabilities", "خصوم متداولة"], ["non-current-liabilities", "خصوم غير متداولة"],
  ["equity", "حقوق ملكية"],
] as const;

export const incomeStatementSections = [
  ["project-revenue", "إيرادات مشروعات"], ["other-income", "إيرادات أخرى"],
  ["project-cost", "تكلفة مشروعات"], ["operating-expense", "مصروفات تشغيلية وإدارية"],
  ["other-expense", "مصروفات أخرى"],
] as const;

function inferredSection(account: Pick<ChartOfAccount, "code" | "name" | "nameEn" | "type">): string {
  const label = `${account.name} ${account.nameEn}`;
  if (account.type === "asset") {
    if (account.code === "110100" || /نقدية|صندوق|cash on hand/i.test(label)) return "cash";
    if (account.code === "110200" || /بنوك|بنك|bank/i.test(label)) return "banks";
    if (account.code.startsWith("159") || /مجمع الإهلاك|accumulated depreciation/i.test(label)) return "contra-assets";
    return account.code.startsWith("15") ? "non-current-assets" : "current-assets";
  }
  if (account.type === "liability") return account.code.startsWith("25") || /طويلة الأجل|long.term/i.test(label) ? "non-current-liabilities" : "current-liabilities";
  if (account.type === "equity") return "equity";
  if (account.type === "revenue") return account.code.startsWith("42") || /أخرى|other/i.test(label) ? "other-income" : "project-revenue";
  if (account.type === "cost") return "project-cost";
  return account.code.startsWith("62") || /أخرى|other/i.test(label) ? "other-expense" : "operating-expense";
}

export function inferAccountClassification(account: Pick<ChartOfAccount, "code" | "name" | "nameEn" | "type">): AccountClassification {
  const statementType: StatementType = ["revenue", "cost", "expense"].includes(account.type) ? "income-statement" : "balance-sheet";
  const normalBalance: NormalBalance = ["liability", "equity", "revenue"].includes(account.type) ? "credit" : "debit";
  const cashFlowCategory: CashFlowCategory = account.type === "equity" || account.type === "liability" && account.code.startsWith("25") ? "financing" : account.type === "asset" && account.code.startsWith("15") ? "investing" : "operating";
  return { statementType, statementSection: inferredSection(account), normalBalance, cashFlowCategory };
}

export function withAccountClassification<T extends ChartOfAccount>(account: T): T {
  const inferred = inferAccountClassification(account);
  const statementType = account.statementType === "balance-sheet" || account.statementType === "income-statement" ? account.statementType : inferred.statementType;
  const sections = validSections(statementType);
  const statementSection = sections.some(([value]) => value === account.statementSection) ? account.statementSection! : statementType === inferred.statementType ? inferred.statementSection : sections[0][0];
  return {
    ...account,
    statementType,
    statementSection,
    normalBalance: account.normalBalance === "debit" || account.normalBalance === "credit" ? account.normalBalance : inferred.normalBalance,
    cashFlowCategory: ["operating", "investing", "financing", "non-cash"].includes(account.cashFlowCategory ?? "") ? account.cashFlowCategory : inferred.cashFlowCategory,
  };
}

export function validSections(statementType: StatementType) {
  return statementType === "balance-sheet" ? balanceSheetSections : incomeStatementSections;
}

export function hasValidAccountClassification(account: ChartOfAccount) {
  return Boolean(account.statementType && account.statementSection && account.normalBalance && account.cashFlowCategory && validSections(account.statementType).some(([value]) => value === account.statementSection));
}
