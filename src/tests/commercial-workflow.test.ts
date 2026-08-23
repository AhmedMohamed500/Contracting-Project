import { describe, expect, it } from "vitest";
import { correspondenceTimeline, convertWonTenderToProject, deadlineState, defaultTenderChecklist, effectiveBidBondStatus, nextCommercialNumber, noticeDeadline, renderLetterTemplate, tenderCostSummary, tenderPipeline } from "@/services/commercial-workflow";
import { createEmptyErpData, normalizeErpData } from "@/repositories/local-storage-erp.repository";
import type { BidBond, Company, CorrespondenceRecord, ErpData, Party, Tender } from "@/types/erp";

const stamp = "2026-08-23T10:00:00.000Z";
const company = (id: string): Company => ({ id, createdAt: stamp, updatedAt: stamp, code: id.toUpperCase(), name: `شركة ${id}`, nameEn: id, taxNumber: "123", phone: "01000000000", email: `${id}@example.com`, address: "Cairo", status: "active" });
const customer = (companyId: string): Party => ({ id: `customer-${companyId}`, createdAt: stamp, updatedAt: stamp, companyId, code: "CUS-1", name: "العميل", phone: "", email: "", taxNumber: "", balance: 0, status: "active" });
const tender = (companyId = "co-a", status: Tender["status"] = "draft"): Tender => ({ id: `tender-${companyId}`, createdAt: stamp, updatedAt: stamp, number: "TND-2026-0001", name: "مناقصة أعمال إنشائية", companyId, clientId: `customer-${companyId}`, clientName: "العميل", consultant: "الاستشاري", projectName: "المشروع الجديد", tenderType: "عام", tenderSource: "دعوة", issueDate: "2026-08-01", submissionDeadline: "2026-09-01", estimatedValue: 1_500_000, currency: "EGP", bidBondRequired: true, bidBondAmount: 30_000, bidBondExpiry: "2026-10-01", status, responsiblePerson: "Estimator", notes: "", probability: 50, checklist: defaultTenderChecklist(), costing: { directCost: 1_000_000, indirectCost: 100_000, overhead: 50_000, contingency: 50_000, markup: 300_000, sellingValue: 1_500_000 } });
const data = (): ErpData => ({ ...createEmptyErpData(), companies: [company("co-a"), company("co-b")], customers: [customer("co-a"), customer("co-b")] });

function record(patch: Partial<CorrespondenceRecord> = {}): CorrespondenceRecord {
  return { id: "rfi-1", createdAt: stamp, updatedAt: stamp, kind: "rfi", number: "RFI-2026-0001", companyId: "co-a", projectId: "project-a", date: "2026-08-10", from: "Site", to: "Consultant", attention: "", cc: "", subject: "Foundation detail", reference: "DWG-01", contractClause: "14", body: "Question", summary: "", requiredAction: "Reply", dueDate: "2026-08-20", assignedTo: "Consultant", priority: "high", status: "submitted", requiresResponse: true, expectedResponseDate: "2026-08-20", preparedBy: "Engineer", reviewedBy: "", approvedBy: "", attachments: [], details: {}, auditTrail: [], ...patch };
}

describe("tendering and official correspondence workflow", () => {
  it("creates the complete editable tender checklist", () => {
    expect(defaultTenderChecklist()).toHaveLength(18);
    expect(defaultTenderChecklist().at(-1)?.label).toContain("تقديم المناقصة");
  });

  it("numbers tenders sequentially per company", () => {
    const value = data(); value.tenders.push(tender("co-a"));
    expect(nextCommercialNumber(value, "co-a", "tender", new Date("2026-08-23"))).toBe("TND-2026-0002");
    expect(nextCommercialNumber(value, "co-b", "tender", new Date("2026-08-23"))).toBe("TND-2026-0001");
  });

  it("uses configurable letter numbering formats", () => {
    const value = data(); value.numberingRules.push({ id: "rule", createdAt: stamp, updatedAt: stamp, companyId: "co-a", recordType: "outgoing", prefix: "LET", format: "{{year}}/{{prefix}}/{{sequence:5}}" });
    expect(nextCommercialNumber(value, "co-a", "outgoing", new Date("2026-08-23"))).toBe("2026/LET/00001");
  });

  it("replaces known template variables and leaves unavailable ones visible", () => {
    const rendered = renderLetterTemplate({ subject: "{{letterNumber}} — {{projectName}}", body: "{{companyName}} / {{missing}}" }, { letterNumber: "OUT-1", projectName: "Project A", companyName: "SiteCost" });
    expect(rendered).toEqual({ subject: "OUT-1 — Project A", body: "SiteCost / {{missing}}" });
  });

  it("calculates tender cost, profit, and margin", () => {
    expect(tenderCostSummary(tender())).toMatchObject({ totalCost: 1_200_000, sellingValue: 1_500_000, expectedProfit: 300_000, margin: 20 });
  });

  it("converts only a won tender and preserves origin/document linkage", () => {
    const value = data(); const won = tender("co-a", "won"); value.tenders.push(won); value.tenderDocuments.push({ id: "tdoc", createdAt: stamp, updatedAt: stamp, tenderId: won.id, number: "DOC-1", title: "BOQ", type: "BOQ", revision: "1", date: "2026-08-01", receivedFrom: "Client", status: "received", fileName: "boq.pdf", fileType: "pdf", fileSize: 100, notes: "" });
    const result = convertWonTenderToProject(won.id, value); const project = result.projects[0];
    expect(project.originTenderId).toBe(won.id);
    expect(project.budget).toBe(1_200_000);
    expect(result.documents[0]).toMatchObject({ projectId: project.id, fileName: "boq.pdf", relatedTransaction: won.number });
  });

  it("rejects conversion before award", () => {
    const value = data(); value.tenders.push(tender());
    expect(() => convertWonTenderToProject(value.tenders[0].id, value)).toThrow(/الفائزة/);
  });

  it("detects expiring and expired bid bonds", () => {
    const base: BidBond = { id: "bond", createdAt: stamp, updatedAt: stamp, companyId: "co-a", tenderId: "tender-co-a", number: "BB-1", bank: "Bank", amount: 1000, issueDate: "2026-08-01", expiryDate: "2026-09-10", status: "active" };
    expect(effectiveBidBondStatus(base, new Date("2026-08-23"))).toBe("expiring");
    expect(effectiveBidBondStatus({ ...base, expiryDate: "2026-08-01" }, new Date("2026-08-23"))).toBe("expired");
  });

  it("detects overdue RFI and letter response deadlines", () => {
    expect(deadlineState("2026-08-20", new Date("2026-08-23"))).toMatchObject({ overdue: true });
    expect(deadlineState("2026-08-30", new Date("2026-08-23"))).toMatchObject({ overdue: false, days: 8 });
  });

  it("calculates contractual notice and EOT deadlines by rule", () => {
    expect(noticeDeadline("2026-08-10", 14)).toBe("2026-08-24");
    expect(noticeDeadline("2026-08-10", 30)).toBe("2026-09-09");
  });

  it("keeps claim status, linkage, and project timeline during migration", () => {
    const value = data(); value.correspondence = [record({ kind: "claim", status: "under-review", relatedVariationId: "vo-5", attachments: undefined as never }), record({ id: "rfi-b", companyId: "co-b", projectId: "project-b" })];
    const normalized = normalizeErpData(value);
    expect(normalized.correspondence[0]).toMatchObject({ status: "under-review", relatedVariationId: "vo-5", attachments: [] });
    expect(correspondenceTimeline(normalized, "project-a")).toHaveLength(1);
  });

  it("isolates tender pipeline values by company", () => {
    const value = data(); value.tenders = [tender("co-a", "won"), { ...tender("co-b", "lost"), id: "tender-b", costing: { ...tender().costing, sellingValue: 9_000_000 } }];
    expect(tenderPipeline(value, "co-a")).toMatchObject({ totalValue: 1_500_000, wonValue: 1_500_000, successRate: 100 });
    expect(tenderPipeline(value, "co-b")).toMatchObject({ totalValue: 9_000_000, lostValue: 9_000_000, successRate: 0 });
  });
});
