import type { Certificate, CertificateLine, CertificateMethod, ErpData } from "@/types/erp";
import { uid, documentNumber } from "@/utils/format";

export interface CertificateDraftInput {
  projectId: string; partyId: string; type: Certificate["type"]; method: CertificateMethod; period: string; cumulativeProgress?: number; currentQuantities?: Record<string, number>; retentionRate: number; taxRate: number; currentAdvanceRecovery: number; withholdingAmount: number; materialDeductions: number; equipmentDeductions: number; penaltyAmount: number; otherDeductions: number; isFinal: boolean;
}

export function certificateHistory(projectId: string, type: Certificate["type"], data: ErpData) {
  return data.certificates.filter((item) => item.projectId === projectId && item.type === type && item.status !== "cancelled").sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function latestCertificate(projectId: string, type: Certificate["type"], data: ErpData) {
  return certificateHistory(projectId, type, data).at(-1);
}

export function projectCertificateSummary(projectId: string, type: Certificate["type"], data: ErpData) {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) throw new Error("PROJECT_REQUIRED");
  const history = certificateHistory(projectId, type, data);
  const approvedVariations = data.variationOrders.filter((item) => item.projectId === projectId && item.status === "approved").reduce((sum, item) => sum + item.revenueImpact, 0);
  const originalContract = data.contracts.find((item) => item.projectId === projectId)?.originalValue ?? project.contractValue;
  const revisedContract = originalContract + approvedVariations;
  const latest = history.at(-1);
  const certifiedValue = history.reduce((sum, item) => sum + item.grossAmount, 0);
  const collected = history.reduce((sum, item) => sum + item.paidAmount, 0);
  const certifiedProgress = latest?.cumulativeProgress ?? (revisedContract ? certifiedValue / revisedContract * 100 : 0);
  const collectedProgress = revisedContract ? collected / revisedContract * 100 : 0;
  const physicalProgress = project.progress;
  return { originalContract, approvedVariations, revisedContract, previousCertifiedValue: certifiedValue, remainingContractValue: Math.max(0, revisedContract - certifiedValue), physicalProgress, certifiedProgress, billedProgress: certifiedProgress, collectedProgress, progressGap: physicalProgress - certifiedProgress, unbilledWork: Math.max(0, physicalProgress - certifiedProgress) / 100 * revisedContract, collectionGap: certifiedProgress - collectedProgress, collected, certifiedValue, latest };
}

export function buildCertificate(input: CertificateDraftInput, data: ErpData): Certificate {
  const project = data.projects.find((item) => item.id === input.projectId);
  if (!project) throw new Error("PROJECT_REQUIRED");
  const previous = latestCertificate(input.projectId, input.type, data);
  if (previous?.isFinal) throw new Error("Final certificate is locked. Reopen or create an adjustment first.");
  const summary = projectCertificateSummary(input.projectId, input.type, data);
  const previousProgress = previous?.cumulativeProgress ?? 0;
  let cumulativeProgress = input.cumulativeProgress ?? previousProgress;
  let currentPeriodProgress = cumulativeProgress - previousProgress;
  let lines: CertificateLine[] = [];
  let grossAmount = 0;
  if (input.method === "boq-quantities") {
    const previousQuantities = new Map<string, number>();
    certificateHistory(input.projectId, input.type, data).flatMap((item) => item.lines ?? []).forEach((item) => previousQuantities.set(item.boqItemId ?? item.id, item.cumulativeQuantity));
    lines = data.boqItems.filter((item) => item.projectId === input.projectId).map((boq) => {
      const previousQuantity = previousQuantities.get(boq.id) ?? 0;
      const currentQuantity = input.currentQuantities?.[boq.id] ?? 0;
      const cumulativeQuantity = previousQuantity + currentQuantity;
      if (currentQuantity < 0 || cumulativeQuantity > boq.quantity + .0001) throw new Error(`BOQ quantity exceeds contract quantity: ${boq.code}`);
      return { id: uid("cert-line"), boqItemId: boq.id, description: boq.description, contractQuantity: boq.quantity, previousQuantity, currentQuantity, cumulativeQuantity, unitRate: boq.unitRate, currentValue: currentQuantity * boq.unitRate, cumulativeValue: cumulativeQuantity * boq.unitRate };
    });
    grossAmount = lines.reduce((sum, item) => sum + item.currentValue, 0);
    const cumulativeValue = lines.reduce((sum, item) => sum + item.cumulativeValue, 0);
    cumulativeProgress = summary.revisedContract ? cumulativeValue / summary.revisedContract * 100 : 0;
    currentPeriodProgress = cumulativeProgress - previousProgress;
  } else {
    if (cumulativeProgress < previousProgress - .0001) throw new Error("Cumulative progress cannot be lower than the previous certified progress.");
    if (cumulativeProgress > 100.0001) throw new Error("Cumulative progress cannot exceed 100% without an approved variation rule.");
    grossAmount = summary.revisedContract * currentPeriodProgress / 100;
  }
  if (input.isFinal && Math.abs(cumulativeProgress - 100) > .01) throw new Error("Final certificate must reach 100% cumulative progress.");
  const timestamp = new Date().toISOString();
  return { id: uid("cert"), createdAt: timestamp, updatedAt: timestamp, number: documentNumber(input.type === "customer" ? "CERT-CUS" : "CERT-SUB", data.certificates.length), projectId: input.projectId, partyId: input.partyId, type: input.type, method: input.method, period: input.period, previousCertificateId: previous?.id, previousProgress, currentPeriodProgress, cumulativeProgress, approvedVariations: summary.approvedVariations, advanceOriginal: previous?.advanceOriginal ?? summary.originalContract * (data.contracts.find((item) => item.projectId === input.projectId)?.advanceRate ?? 0) / 100, previousAdvanceRecovery: certificateHistory(input.projectId, input.type, data).reduce((sum, item) => sum + (item.currentAdvanceRecovery ?? 0), 0), currentAdvanceRecovery: input.currentAdvanceRecovery, releasedRetention: 0, withholdingAmount: input.withholdingAmount, materialDeductions: input.materialDeductions, equipmentDeductions: input.equipmentDeductions, penaltyAmount: input.penaltyAmount, otherDeductions: input.otherDeductions, isFinal: input.isFinal, lines, grossAmount, retentionRate: input.retentionRate, taxRate: input.taxRate, paidAmount: 0, status: "submitted" };
}

export function certificateNet(certificate: Certificate) {
  const retention = certificate.grossAmount * certificate.retentionRate / 100;
  const tax = certificate.grossAmount * certificate.taxRate / 100;
  const deductions = retention + (certificate.currentAdvanceRecovery ?? 0) + (certificate.withholdingAmount ?? 0) + (certificate.materialDeductions ?? 0) + (certificate.equipmentDeductions ?? 0) + (certificate.penaltyAmount ?? 0) + (certificate.otherDeductions ?? 0);
  return { retention, tax, deductions, net: certificate.grossAmount + tax - deductions };
}
