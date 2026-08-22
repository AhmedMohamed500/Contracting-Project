import { describe, expect, it } from "vitest";
import { buildCertificate, certificateNet } from "@/services/certificate-engine";
import { demoData } from "@/data/demo-data";
import type { ErpData } from "@/types/erp";

const clone = (): ErpData => JSON.parse(JSON.stringify(demoData)) as ErpData;
const baseInput = { projectId: "prj-2", partyId: "cus-2", type: "customer" as const, method: "overall-progress" as const, period: "2026-08", retentionRate: 5, taxRate: 14, currentAdvanceRecovery: 0, withholdingAmount: 0, materialDeductions: 0, equipmentDeductions: 0, penaltyAmount: 0, otherDeductions: 0, isFinal: false };

describe("cumulative certificate engine", () => {
  it("calculates the first certificate from 0% to 20%", () => {
    const certificate = buildCertificate({ ...baseInput, cumulativeProgress: 20 }, clone());
    expect(certificate.previousProgress).toBe(0);
    expect(certificate.currentPeriodProgress).toBe(20);
    expect(certificate.cumulativeProgress).toBe(20);
  });

  it("calculates the second certificate current value as cumulative minus previous", () => {
    const data = clone(); data.certificates = [];
    const first = buildCertificate({ ...baseInput, cumulativeProgress: 20 }, data); data.certificates.push(first);
    const second = buildCertificate({ ...baseInput, period: "2026-09", cumulativeProgress: 35 }, data);
    expect(second.previousProgress).toBe(20);
    expect(second.currentPeriodProgress).toBe(15);
    expect(second.grossAmount).toBe(data.projects.find((item) => item.id === "prj-2")!.contractValue * .15);
  });

  it("rejects cumulative progress lower than the previous certificate", () => {
    const data = clone(); data.certificates = [];
    data.certificates.push(buildCertificate({ ...baseInput, cumulativeProgress: 50 }, data));
    expect(() => buildCertificate({ ...baseInput, cumulativeProgress: 45 }, data)).toThrow(/cannot be lower/i);
  });

  it("rejects cumulative progress above 100%", () => expect(() => buildCertificate({ ...baseInput, cumulativeProgress: 101 }, clone())).toThrow(/cannot exceed/i));

  it("uses prior BOQ quantities and rejects quantities above the contract", () => {
    const data = clone(); data.certificates = [];
    const boq = data.boqItems.find((item) => item.projectId === "prj-2")!;
    const first = buildCertificate({ ...baseInput, method: "boq-quantities", currentQuantities: { [boq.id]: 1000 } }, data); data.certificates.push(first);
    const second = buildCertificate({ ...baseInput, method: "boq-quantities", period: "2026-09", currentQuantities: { [boq.id]: 500 } }, data);
    expect(second.lines?.[0].previousQuantity).toBe(1000);
    expect(second.lines?.[0].cumulativeQuantity).toBe(1500);
    expect(() => buildCertificate({ ...baseInput, method: "boq-quantities", currentQuantities: { [boq.id]: boq.quantity } }, data)).toThrow(/exceeds/i);
  });

  it("calculates advance recovery, retention and deductions into net value", () => {
    const certificate = buildCertificate({ ...baseInput, cumulativeProgress: 20, currentAdvanceRecovery: 100000, withholdingAmount: 25000, otherDeductions: 5000 }, clone());
    const totals = certificateNet(certificate);
    expect(totals.deductions).toBe(totals.retention + 130000);
    expect(totals.net).toBe(certificate.grossAmount + totals.tax - totals.deductions);
  });

  it("locks later certificates after a final 100% certificate", () => {
    const data = clone(); data.certificates = [];
    data.certificates.push(buildCertificate({ ...baseInput, cumulativeProgress: 100, isFinal: true }, data));
    expect(() => buildCertificate({ ...baseInput, period: "2026-09", cumulativeProgress: 100 }, data)).toThrow(/locked/i);
  });
});
