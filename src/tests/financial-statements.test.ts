import { describe, expect, it } from "vitest";
import { balanceSheet, cashFlowStatement, detailedTrialBalance, equityStatement, financialReportingIssues, incomeStatement } from "@/services/financial-statements";
import { demoData } from "@/data/demo-data";
import { normalizeErpData } from "@/repositories/local-storage-erp.repository";
import { localDateInputValue } from "@/utils/format";
import type { ErpData } from "@/types/erp";

const clone = (): ErpData => JSON.parse(JSON.stringify(demoData)) as ErpData;
const filters = { companyId: "co-atlas", from: "2026-01-01", to: "2026-12-31" };

describe("financial statements from posted journal lines", () => {
  it("uses the local accounting date instead of UTC for report cut-off", () => {
    expect(localDateInputValue(new Date(2026, 7, 24, 0, 30))).toBe("2026-08-24");
  });
  it("keeps trial-balance debits and credits equal", () => {
    const rows = detailedTrialBalance(clone(), filters);
    expect(rows.reduce((sum, row) => sum + row.periodDebit, 0)).toBe(rows.reduce((sum, row) => sum + row.periodCredit, 0));
  });

  it("calculates the income statement without fake figures", () => {
    const statement = incomeStatement(clone(), filters);
    expect(statement.projectRevenue).toBe(7_200_000);
    expect(statement.projectCost).toBe(1_885_000);
    expect(statement.netProfit).toBe(5_315_000);
  });

  it("reconciles assets with liabilities, equity and current profit", () => {
    const statement = balanceSheet(clone(), { ...filters, from: undefined });
    expect(statement.assets).toBe(statement.liabilitiesAndEquity);
    expect(statement.difference).toBe(0);
  });

  it("reconciles closing cash flow with balance-sheet cash and banks", () => {
    const statement = cashFlowStatement(clone(), filters);
    expect(statement.closingCash).toBe(statement.balanceCash);
    expect(statement.difference).toBe(0);
  });

  it("derives closing equity from available accounts and period profit", () => {
    const statement = equityStatement(clone(), filters);
    expect(statement.closing).toBe(statement.opening + statement.capitalAdditions + statement.netProfit + statement.drawings + statement.adjustments);
  });

  it("excludes non-posted journals from every financial report", () => {
    const data = clone(); const draft = { ...data.journalEntries[0], id: "draft-copy", status: "draft" as const, lines: data.journalEntries[0].lines.map((line) => ({ ...line, debit: line.debit * 100, credit: line.credit * 100 })) }; data.journalEntries.push(draft);
    expect(incomeStatement(data, filters)).toEqual(incomeStatement(clone(), filters));
  });

  it("migrates legacy accounts into financial statements without changing posted figures", () => {
    const legacy = clone();
    legacy.chartOfAccounts = legacy.chartOfAccounts.map((account) => { const copy = { ...account }; delete copy.statementType; delete copy.statementSection; delete copy.normalBalance; delete copy.cashFlowCategory; return copy; });
    const normalized = normalizeErpData(legacy);
    expect(normalized.chartOfAccounts.every((account) => account.statementType && account.statementSection && account.normalBalance && account.cashFlowCategory)).toBe(true);
    expect(incomeStatement(normalized, filters).netProfit).toBe(5_315_000);
    expect(balanceSheet(normalized, { ...filters, from: undefined }).difference).toBe(0);
  });

  it("preserves a user's explicit financial statement classification", () => {
    const data = clone();
    data.chartOfAccounts = data.chartOfAccounts.map((account) => account.code === "410100" ? { ...account, statementSection: "other-income" } : account);
    const normalized = normalizeErpData(data);
    expect(normalized.chartOfAccounts.find((account) => account.code === "410100")?.statementSection).toBe("other-income");
    expect(incomeStatement(normalized, filters)).toMatchObject({ projectRevenue: 0, otherIncome: 7_200_000 });
  });

  it("reports posted lines whose accounts are missing instead of silently dropping them", () => {
    const data = clone();
    data.chartOfAccounts = data.chartOfAccounts.filter((account) => account.code !== "410100");
    expect(financialReportingIssues(data, filters)).toContainEqual({ accountCode: "410100", accountName: "إيرادات عقود المشاريع", reason: "missing-account" });
  });
});
