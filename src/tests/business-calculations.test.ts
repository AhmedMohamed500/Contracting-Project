import { describe, expect, it } from "vitest";
import { demoData } from "@/data/demo-data";
import { assertBalancedJournal, calculateBudgetVariance, calculateCertificate, calculateProjectCost, calculateProjectHealth, calculateTrialBalance, generateAutomaticJournal, inventoryBalance, projectIncomeStatement, projectLedger, projectReconciliation, projectTrialBalance, reverseJournal } from "@/services/business-calculations";

describe("construction ERP calculations", () => {
  it("calculates certificate tax, retention, net and outstanding", () => {
    const result = calculateCertificate({ grossAmount: 1_000_000, retentionRate: 5, taxRate: 14, paidAmount: 500_000 });
    expect(result).toEqual({ retention: 50_000, tax: 140_000, net: 1_090_000, outstanding: 590_000 });
  });

  it("rejects unbalanced journals and accepts balanced ones", () => {
    expect(assertBalancedJournal([{ debit: 100, credit: 0 }, { debit: 0, credit: 100 }])).toBe(true);
    expect(() => assertBalancedJournal([{ debit: 100, credit: 0 }])).toThrow("UNBALANCED_JOURNAL");
  });

  it("keeps the trial balance balanced", () => {
    const rows = calculateTrialBalance(demoData.journalEntries);
    expect(rows.reduce((sum, row) => sum + row.debit, 0)).toBe(rows.reduce((sum, row) => sum + row.credit, 0));
  });

  it("calculates stock from posted receipts and issues", () => {
    expect(inventoryBalance("حديد تسليح", "مخزن موقع الإسكندرية", demoData)).toBe(23);
  });

  it("integrates inventory, expenses and subcontract certificates into project cost", () => {
    expect(calculateProjectCost("prj-1", demoData)).toBeGreaterThan(demoData.projects[0].actualCost);
    const variance = calculateBudgetVariance(demoData.projects[0], demoData);
    expect(variance.actual).toBe(calculateProjectCost("prj-1", demoData));
  });

  it("returns a bounded rule-based project health score", () => {
    const health = calculateProjectHealth(demoData.projects[0], demoData);
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
  });

  it("generates a balanced dimensioned journal from a material issue", () => {
    const journal = generateAutomaticJournal({ kind: "material-issue", companyId: "co-atlas", projectId: "prj-1", sourceNumber: "MAT-ISS-TEST", date: "2026-08-21", description: "Cement", amount: 125_000, costCode: "01.02 — Concrete Works", boqItemId: "boq-1" }, demoData);
    expect(journal.automatic).toBe(true);
    expect(journal.lines[0].accountCode).toBe("510100");
    expect(journal.lines[0].costCenterCode).toBe("CC-PRJ-026");
    expect(journal.lines[0].boqItemId).toBe("boq-1");
    expect(assertBalancedJournal(journal.lines)).toBe(true);
  });

  it("supports project ledger, project trial balance and project income statement", () => {
    expect(projectLedger("prj-1", demoData).length).toBeGreaterThan(0);
    const trial = projectTrialBalance("prj-1", demoData);
    expect(trial.reduce((sum, row) => sum + row.periodDebit - row.periodCredit, 0)).toBe(0);
    expect(projectIncomeStatement("prj-1", demoData).revenue).toBe(7_200_000);
  });

  it("reconciles the posted operational cost ledger with project accounting", () => {
    expect(projectReconciliation("prj-1", demoData).difference).toBe(0);
  });

  it("creates a balanced reversal without modifying the posted original", () => {
    const original = demoData.journalEntries[0];
    const reversal = reverseJournal(original, demoData);
    expect(reversal.reversedFromId).toBe(original.id);
    expect(reversal.lines[0].debit).toBe(original.lines[0].credit);
    expect(assertBalancedJournal(reversal.lines)).toBe(true);
    expect(original.status).toBe("posted");
  });
});
