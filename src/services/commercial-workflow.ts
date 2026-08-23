import type { BidBond, Company, CorrespondenceKind, CorrespondenceRecord, ErpData, LetterTemplate, Party, Project, Tender, TenderChecklistItem } from "@/types/erp";
import { uid } from "@/utils/format";

const tenderChecklistLabels = [
  "استلام مستندات المناقصة", "استلام الرسومات", "استلام جدول الكميات", "استلام المواصفات", "إتمام زيارة الموقع",
  "إتمام المراجعة الفنية", "إتمام مراجعة الكميات", "إتمام تحليل الأسعار", "استلام عروض الموردين", "استلام عروض مقاولي الباطن",
  "إتمام المراجعة التجارية", "إتمام المراجعة الضريبية", "تجهيز الضمان الابتدائي", "تجهيز المظروف الفني",
  "تجهيز المظروف المالي", "استكمال التوقيعات المعتمدة", "إتمام المراجعة النهائية", "تقديم المناقصة",
];

export function defaultTenderChecklist(): TenderChecklistItem[] {
  return tenderChecklistLabels.map((label, index) => ({ id: `tender-check-${index + 1}`, label, completed: false }));
}

const prefixes: Record<"tender" | CorrespondenceKind, string> = { tender: "TND", outgoing: "OUT", incoming: "IN", memo: "MEM", email: "EML", transmittal: "TRN", notice: "NOC", rfi: "RFI", submittal: "SUB", "site-instruction": "SI", inspection: "IR", ncr: "NCR", claim: "CLM", meeting: "MOM", action: "ACT", delay: "DLY", eot: "EOT" };

export function nextCommercialNumber(data: ErpData, companyId: string, type: "tender" | CorrespondenceKind, date = new Date()) {
  const rule = data.numberingRules.find((item) => item.companyId === companyId && item.recordType === type);
  const prefix = rule?.prefix || prefixes[type];
  const format = rule?.format || "{{prefix}}-{{year}}-{{sequence:4}}";
  const year = date.getFullYear();
  const count = type === "tender"
    ? data.tenders.filter((item) => item.companyId === companyId && new Date(item.issueDate).getFullYear() === year).length + 1
    : data.correspondence.filter((item) => item.companyId === companyId && item.kind === type && new Date(item.date).getFullYear() === year).length + 1;
  return format.replaceAll("{{prefix}}", prefix).replaceAll("{{year}}", String(year)).replace(/\{\{sequence(?::(\d+))?\}\}/g, (_, width) => String(count).padStart(Number(width || 4), "0"));
}

export function renderLetterTemplate(template: Pick<LetterTemplate, "subject" | "body">, variables: Record<string, string | number | undefined>) {
  const replace = (text: string) => text.replace(/\{\{([a-zA-Z0-9]+)\}\}/g, (_, key) => variables[key] === undefined ? `{{${key}}}` : String(variables[key]));
  return { subject: replace(template.subject), body: replace(template.body) };
}

const templateNames: Array<[string, string, CorrespondenceKind]> = [
  ["TENDER-SUBMISSION", "خطاب تقديم عرض مناقصة", "outgoing"], ["TENDER-DECLINE", "خطاب اعتذار عن دخول مناقصة", "outgoing"],
  ["TENDER-EXTENSION", "طلب تمديد موعد تقديم المناقصة", "outgoing"], ["TENDER-CLARIFICATION", "خطاب استفسار عن المناقصة", "outgoing"],
  ["TECH-FIN-OFFER", "إرسال العرض الفني والمالي", "transmittal"], ["PRICE-APPROVAL", "طلب اعتماد أسعار", "outgoing"],
  ["MATERIAL-APPROVAL", "طلب اعتماد مادة", "submittal"], ["SUPPLIER-APPROVAL", "طلب اعتماد مورد", "submittal"],
  ["SUBCONTRACTOR-APPROVAL", "طلب اعتماد مقاول باطن", "submittal"], ["SHOP-DRAWING", "تقديم رسومات الورشة", "submittal"],
  ["INSPECTION", "طلب معاينة", "inspection"], ["RFI", "طلب معلومات فنية", "rfi"], ["VARIATION", "طلب اعتماد تغيير", "claim"],
  ["FINANCIAL-CLAIM", "مطالبة مالية", "claim"], ["EOT", "مطالبة بمدة إضافية", "eot"], ["DELAY", "إخطار تأخير أعمال", "delay"],
  ["PRICE-ESCALATION", "مطالبة بفروقات أسعار", "claim"], ["CERTIFICATE", "خطاب تقديم مستخلص", "outgoing"],
  ["PAYMENT", "طلب صرف مستحقات", "outgoing"], ["PAYMENT-REMINDER", "مطالبة بمستحقات متأخرة", "notice"],
  ["RETENTION", "طلب صرف احتجاز", "outgoing"], ["TAKING-OVER", "طلب تسليم ابتدائي", "outgoing"],
  ["FINAL-HANDOVER", "طلب تسليم نهائي", "outgoing"], ["COMPLETION", "طلب إصدار شهادة إنجاز", "outgoing"],
  ["TRANSMITTAL", "خطاب إرسال مستندات", "transmittal"], ["SAMPLE", "خطاب إرسال عينات", "transmittal"],
  ["TEST-RESULT", "إرسال نتائج اختبارات", "transmittal"], ["CHANGE", "إخطار تغيير", "notice"],
  ["SITE-INSTRUCTION", "رد على أمر موقع", "site-instruction"], ["OBJECTION", "خطاب رفض أو تحفظ", "notice"],
  ["PUNCH-LIST", "طلب إغلاق قائمة الملاحظات", "outgoing"],
];

export const systemLetterTemplates: LetterTemplate[] = templateNames.map(([code, name, kind], index) => ({ id: `system-template-${index + 1}`, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", code, name, kind, language: "ar", subject: `{{subject}}`, body: `السادة / {{clientName}}\n\nتحية طيبة وبعد،\n\nبالإشارة إلى {{reference}} بخصوص {{projectName}}، نرفق لسيادتكم ${name}.\n\nوتفضلوا بقبول فائق الاحترام.\n{{companyName}}`, favorite: false, status: "active" }));

export function templateVariables(input: { company?: Company; project?: Project; tender?: Tender; recordNumber: string; subject: string; contractNumber?: string; clientName?: string; reference?: string; amount?: number }) {
  return { companyName: input.company?.name, projectName: input.project?.name || input.tender?.projectName, tenderNumber: input.tender?.number, contractNumber: input.contractNumber, letterNumber: input.recordNumber, date: new Date().toLocaleDateString("ar-EG"), clientName: input.clientName || input.tender?.clientName, consultantName: input.tender?.consultant, subject: input.subject, reference: input.reference, amount: input.amount };
}

export function tenderCostSummary(tender: Pick<Tender, "costing">) {
  const { directCost, indirectCost, overhead, contingency, markup, sellingValue } = tender.costing;
  const totalCost = directCost + indirectCost + overhead + contingency;
  const calculatedSelling = sellingValue || totalCost + markup;
  const expectedProfit = calculatedSelling - totalCost;
  return { totalCost, sellingValue: calculatedSelling, expectedProfit, margin: calculatedSelling ? expectedProfit / calculatedSelling * 100 : 0 };
}

export function tenderPipeline(data: ErpData, companyId: string) {
  const tenders = data.tenders.filter((item) => item.companyId === companyId);
  const sum = (items: Tender[]) => items.reduce((total, item) => total + (item.costing.sellingValue || item.estimatedValue), 0);
  const won = tenders.filter((item) => item.status === "won"), lost = tenders.filter((item) => item.status === "lost");
  return { tenders, totalValue: sum(tenders), submittedValue: sum(tenders.filter((item) => ["submitted", "under-evaluation", "won", "lost"].includes(item.status))), wonValue: sum(won), lostValue: sum(lost), successRate: won.length + lost.length ? won.length / (won.length + lost.length) * 100 : 0 };
}

export function effectiveBidBondStatus(bond: BidBond, today = new Date()) {
  if (bond.status === "released") return "released" as const;
  const days = Math.ceil((new Date(`${bond.expiryDate}T23:59:59`).getTime() - today.getTime()) / 86400000);
  return days < 0 ? "expired" as const : days <= 30 ? "expiring" as const : "active" as const;
}

export function deadlineState(date?: string, today = new Date()) {
  if (!date) return { overdue: false, days: undefined };
  const days = Math.ceil((new Date(`${date}T23:59:59`).getTime() - today.getTime()) / 86400000);
  return { overdue: days < 0, days };
}

export function noticeDeadline(eventDate: string, noticePeriodDays: number) {
  const value = new Date(`${eventDate}T00:00:00.000Z`); value.setUTCDate(value.getUTCDate() + noticePeriodDays); return value.toISOString().slice(0, 10);
}

export function convertWonTenderToProject(tenderId: string, data: ErpData): ErpData {
  const tender = data.tenders.find((item) => item.id === tenderId);
  if (!tender) throw new Error("المناقصة غير موجودة.");
  if (tender.status !== "won") throw new Error("يمكن تحويل المناقصة الفائزة فقط.");
  if (tender.convertedProjectId) throw new Error("تم تحويل المناقصة إلى مشروع بالفعل.");
  const timestamp = new Date().toISOString(); const projectId = uid("prj"); const summary = tenderCostSummary(tender);
  const generatedCustomer: Party | undefined = tender.clientId ? undefined : { id: uid("cus"), createdAt: timestamp, updatedAt: timestamp, companyId: tender.companyId, code: `CUS-${String(data.customers.length + 1).padStart(4, "0")}`, name: tender.clientName, phone: "", email: "", taxNumber: "", balance: 0, status: "active" };
  const customerId = tender.clientId || generatedCustomer!.id;
  const project: Project = { id: projectId, createdAt: timestamp, updatedAt: timestamp, code: tender.number.replace(/^TND-/, "PRJ-"), name: tender.projectName || tender.name, customerId, companyId: tender.companyId, costCenterCode: `CC-${tender.number}`, wbsCode: `WBS-${tender.number}`, location: "", contractValue: summary.sellingValue, budget: summary.totalCost, actualCost: 0, progress: 0, startDate: timestamp.slice(0, 10), endDate: timestamp.slice(0, 10), originTenderId: tender.id, status: "active" };
  const copiedDocuments = data.tenderDocuments.filter((item) => item.tenderId === tender.id && item.fileName).map((item) => ({ id: uid("doc"), createdAt: timestamp, updatedAt: timestamp, fileName: item.fileName!, type: item.fileType || "file", size: item.fileSize || 0, category: `Origin Tender — ${item.type}`, projectId, relatedTransaction: tender.number, description: item.title, uploadDate: item.date }));
  return { ...data, customers: generatedCustomer ? [...data.customers, generatedCustomer] : data.customers, projects: [...data.projects, project], documents: [...data.documents, ...copiedDocuments], tenders: data.tenders.map((item) => item.id === tender.id ? { ...item, clientId: customerId, convertedProjectId: projectId, updatedAt: timestamp } : item) };
}

export function correspondenceTimeline(data: ErpData, projectId: string) {
  return data.correspondence.filter((item) => item.projectId === projectId).sort((a, b) => b.date.localeCompare(a.date));
}

export function createRecordAudit(action: CorrespondenceRecord["auditTrail"][number]["action"], user: string): CorrespondenceRecord["auditTrail"][number] { return { action, user, timestamp: new Date().toISOString() }; }
