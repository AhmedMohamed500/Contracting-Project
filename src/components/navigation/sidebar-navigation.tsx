"use client";

import { useEffect, type ElementType } from "react";
import { AlertTriangle, Blocks, BookOpen, Building2, Calculator, ChartNoAxesCombined, CheckCircle2, ChevronDown, ClipboardList, FileSpreadsheet, FileText, FolderKanban, Package, Receipt, RotateCcw, Scale, Settings, ShieldCheck, Truck, Upload, Users, Wallet, WalletCards, Warehouse } from "lucide-react";
import type { Language, ModuleKey } from "@/store/ui-store";

type Label = { ar: string; en: string };
export type NavigationItem = Label & { key: ModuleKey; icon: ElementType };
type NavigationSubgroup = Label & { id: string; children: NavigationItem[] };
type NavigationGroup = Label & { id: string; icon: ElementType; children: Array<NavigationItem | NavigationSubgroup> };

const item = (key: ModuleKey, ar: string, en: string, icon: ElementType): NavigationItem => ({ key, ar, en, icon });
const subgroup = (id: string, ar: string, en: string, children: NavigationItem[]): NavigationSubgroup => ({ id, ar, en, children });

export const dashboardNavigationItem = item("dashboard", "لوحة الإدارة", "Executive Dashboard", ChartNoAxesCombined);

export const navigationGroups: NavigationGroup[] = [
  { id: "master", ar: "البيانات الأساسية", en: "Master Data", icon: Building2, children: [
    item("companies", "الشركات", "Companies", Building2), item("parties", "العملاء والموردون", "Business Partners", Users), item("projects", "المشروعات", "Projects", FolderKanban), item("contracts", "العقود والتغييرات", "Contracts & Changes", FileText),
  ] },
  { id: "planning", ar: "التخطيط والتكلفة", en: "Planning & Cost", icon: Blocks, children: [
    item("structures", "هيكل تقسيم العمل (WBS) وأكواد التكلفة", "WBS & Cost Codes", Blocks), item("boq", "جدول الكميات (BOQ) وتحليل الأسعار", "BOQ & Rate Analysis", ClipboardList),
  ] },
  { id: "procurement", ar: "المشتريات والمخازن", en: "Procurement & Inventory", icon: Truck, children: [
    item("procurement", "المشتريات", "Procurement", Truck), item("warehouses", "المخازن", "Warehouses", Warehouse), item("inventory", "حركات المخزون", "Inventory Movements", Package),
  ] },
  { id: "site", ar: "عمليات الموقع", en: "Site Operations", icon: Receipt, children: [item("expenses", "مصروفات المواقع", "Project Expenses", Receipt)] },
  { id: "certificates", ar: "المستخلصات", en: "Certificates", icon: FileText, children: [item("certificates", "مستخلصات العملاء ومقاولي الباطن", "Customer & Subcontractor Certificates", FileText)] },
  { id: "accounting", ar: "الحسابات", en: "Accounting", icon: Calculator, children: [
    subgroup("accounting-daily", "العمليات اليومية", "Daily Operations", [
      item("accounting", "لوحة المحاسب", "Accountant Dashboard", ChartNoAxesCombined), item("accounting-documents", "المستندات المحاسبية", "Accounting Documents", FileText), item("accounting-journals", "القيود اليومية", "Journal Entries", BookOpen), item("treasury", "الخزينة والبنوك", "Treasury & Banks", Wallet), item("settlements", "التسويات", "Settlements", RotateCcw),
    ]),
    subgroup("accounting-ledgers", "الأستاذ والذمم", "Ledgers & Subledgers", [
      item("general-ledger", "دفتر الأستاذ العام", "General Ledger", BookOpen), item("subsidiary-ledger", "الأستاذ المساعد", "Subsidiary Ledgers", Users), item("receivables", "الذمم المدينة", "Receivables", WalletCards), item("payables", "الذمم الدائنة", "Payables", WalletCards),
    ]),
    subgroup("accounting-statements", "الموازين والقوائم", "Balances & Statements", [
      item("trial-balance", "ميزان المراجعة", "Trial Balance", Scale), item("financial-statements", "القوائم المالية", "Financial Statements", FileSpreadsheet), item("income-statement", "قائمة الدخل", "Income Statement", ChartNoAxesCombined), item("balance-sheet", "قائمة المركز المالي", "Financial Position", Building2), item("cash-flow-statement", "قائمة التدفقات النقدية", "Cash Flow Statement", Wallet), item("equity-statement", "قائمة التغيرات في حقوق الملكية", "Changes in Equity", ChartNoAxesCombined),
    ]),
    subgroup("accounting-period", "نهاية الفترة", "Period End", [
      item("adjusted-trial", "ميزان المراجعة المعدل", "Adjusted Trial Balance", Scale), item("accounting-closing", "إقفال الفترة", "Period Closing", ClipboardList), item("post-closing-trial", "ميزان ما بعد الإقفال", "Post-closing Trial Balance", Scale),
    ]),
    subgroup("accounting-control", "الإعداد والرقابة", "Configuration & Control", [
      item("chart-accounts", "دليل الحسابات", "Chart of Accounts", BookOpen), item("cost-centers", "مراكز التكلفة", "Cost Centers", Blocks), item("account-mapping", "الربط المحاسبي", "Account Mapping", Settings), item("accounting-control", "الرقابة المحاسبية", "Accounting Control", ShieldCheck), item("costing", "تكاليف وربحية المشروعات", "Project Costing", Calculator),
    ]),
  ] },
  { id: "tender", ar: "المناقصات والعقود", en: "Tendering & Contracts", icon: ClipboardList, children: [
    item("tenders", "المناقصات", "Tenders", ClipboardList), item("tender-costing", "تسعير المناقصات", "Tender Costing", Calculator), item("tender-clarifications", "استفسارات المناقصات", "Tender Clarifications", FileText), item("tender-letters", "خطابات المناقصات", "Tender Letters", FileText), item("bid-bonds", "الضمانات الابتدائية", "Bid Bonds", ShieldCheck),
  ] },
  { id: "correspondence", ar: "المكاتبات والمستندات", en: "Correspondence & Documents", icon: FileText, children: [
    item("correspondence-dashboard", "مركز المكاتبات", "Correspondence Center", ChartNoAxesCombined), item("outgoing-letters", "الخطابات الصادرة", "Outgoing Letters", FileText), item("incoming-letters", "الخطابات الواردة", "Incoming Letters", FileText), item("rfi", "طلبات المعلومات (RFI)", "RFIs", FileText), item("submittals", "الاعتمادات (Submittals)", "Submittals", CheckCircle2), item("transmittals", "خطابات الإرسال (Transmittals)", "Transmittals", Upload), item("site-instructions", "تعليمات الموقع", "Site Instructions", ClipboardList), item("inspections", "طلبات الفحص", "Inspection Requests", ShieldCheck), item("ncr", "تقارير عدم المطابقة (NCR)", "NCRs", AlertTriangle), item("claims", "المطالبات", "Claims", WalletCards), item("meeting-minutes", "محاضر الاجتماعات", "Meeting Minutes", Users), item("action-tracker", "متابعة الإجراءات", "Action Tracker", ClipboardList), item("letter-templates", "قوالب الخطابات", "Letter Templates", FileText),
  ] },
  { id: "system", ar: "النظام", en: "System", icon: Settings, children: [item("documents", "مركز المستندات", "Documents Center", Blocks), item("settings", "الإعدادات والنسخ الاحتياطي", "Settings & Backup", Settings)] },
];

const isSubgroup = (value: NavigationItem | NavigationSubgroup): value is NavigationSubgroup => "children" in value;
export const navigationItems = [dashboardNavigationItem, ...navigationGroups.flatMap((group) => group.children.flatMap((child) => isSubgroup(child) ? child.children : [child]))];

export function activeNavigationAncestors(module: ModuleKey): string[] {
  for (const group of navigationGroups) {
    for (const child of group.children) {
      if (isSubgroup(child) && child.children.some((entry) => entry.key === module)) return [group.id, child.id];
      if (!isSubgroup(child) && child.key === module) return [group.id];
    }
  }
  return [];
}

interface SidebarNavigationProps {
  language: Language;
  activeModule: ModuleKey;
  expandedGroups: string[];
  onNavigate: (module: ModuleKey) => void;
  onEnsureExpanded: (groups: string[]) => void;
  onToggleGroup: (group: string) => void;
}

export function SidebarNavigation({ language, activeModule, expandedGroups, onNavigate, onEnsureExpanded, onToggleGroup }: SidebarNavigationProps) {
  const t = (label: Label) => language === "ar" ? label.ar : label.en;
  const ancestors = activeNavigationAncestors(activeModule);
  useEffect(() => { onEnsureExpanded(activeNavigationAncestors(activeModule)); }, [activeModule, onEnsureExpanded]);
  const isOpen = (id: string) => expandedGroups.includes(id) || ancestors.includes(id);
  const renderItem = (entry: NavigationItem, depth = 1) => <button key={entry.key} className={`nav-button nav-depth-${depth} ${activeModule === entry.key ? "active" : ""}`} aria-current={activeModule === entry.key ? "page" : undefined} onClick={() => onNavigate(entry.key)}><entry.icon size={16}/><span>{t(entry)}</span></button>;
  return <nav className="nav-scroll" aria-label={language === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
    {renderItem(dashboardNavigationItem, 0)}
    {navigationGroups.map((group) => { const open = isOpen(group.id); const panelId = `nav-${group.id}`; return <section className="nav-group" key={group.id}>
      <button className={`nav-group-button ${ancestors.includes(group.id) ? "contains-active" : ""}`} aria-expanded={open} aria-controls={panelId} onClick={() => onToggleGroup(group.id)}><group.icon size={17}/><span>{t(group)}</span><ChevronDown className="nav-chevron" size={16}/></button>
      <div id={panelId} className="nav-group-panel" hidden={!open}>{group.children.map((child) => {
        if (!isSubgroup(child)) return renderItem(child);
        const childOpen = isOpen(child.id); const childPanelId = `nav-${child.id}`;
        return <div className="nav-subgroup" key={child.id}><button className={`nav-subgroup-button ${ancestors.includes(child.id) ? "contains-active" : ""}`} aria-expanded={childOpen} aria-controls={childPanelId} onClick={() => onToggleGroup(child.id)}><span>{t(child)}</span><ChevronDown className="nav-chevron" size={14}/></button><div id={childPanelId} className="nav-subgroup-panel" hidden={!childOpen}>{child.children.map((entry) => renderItem(entry, 2))}</div></div>;
      })}</div>
    </section>; })}
  </nav>;
}
