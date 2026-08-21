import { describe, expect, it } from "vitest";
import { demoData } from "@/data/demo-data";
import { assertBalancedJournal, calculateBudgetVariance, calculateCertificate, calculateProjectCost, calculateProjectHealth, calculateTrialBalance, inventoryBalance } from "@/services/business-calculations";

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
});
