"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Building2, CheckCircle2, Eye, EyeOff, HardHat, ImageUp, Languages, LockKeyhole, Settings2, UserRound } from "lucide-react";
import { branding } from "@/config/branding";
import { validatePrototypePassword } from "@/services/local-auth";
import type { Company } from "@/types/erp";

export interface CompanySetupInput {
  code: string; name: string; nameEn: string; commercialRegistration: string; taxNumber: string;
  address: string; country: string; phone: string; email: string; currency: string;
  fiscalYearStartMonth: number; defaultTaxRate: number; defaultRetentionRate: number;
  logoMetadata: string; logoDataUrl?: string; adminFullName: string; username: string; password: string;
}

type Language = "ar" | "en";

export function SetupWizard({ onComplete, existingCompany }: { onComplete: (values: CompanySetupInput) => Promise<void>; existingCompany?: Company }) {
  const [language, setLanguage] = useState<Language>("ar");
  const [step, setStep] = useState(existingCompany ? 3 : 0);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoError, setLogoError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<CompanySetupInput>({ code: existingCompany?.code ?? "", name: existingCompany?.name ?? "", nameEn: existingCompany?.nameEn ?? "", commercialRegistration: existingCompany?.commercialRegistration ?? "", taxNumber: existingCompany?.taxNumber ?? "", address: existingCompany?.address ?? "", country: existingCompany?.country ?? "مصر", phone: existingCompany?.phone ?? "", email: existingCompany?.email ?? "", currency: existingCompany?.currency ?? "EGP", fiscalYearStartMonth: existingCompany?.fiscalYearStartMonth ?? 1, defaultTaxRate: existingCompany?.defaultTaxRate ?? 14, defaultRetentionRate: existingCompany?.defaultRetentionRate ?? 5, logoMetadata: existingCompany?.logoMetadata ?? "", logoDataUrl: existingCompany?.logoDataUrl, adminFullName: "", username: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const t = (ar: string, en: string) => language === "ar" ? ar : en;
  const set = <K extends keyof CompanySetupInput>(key: K, value: CompanySetupInput[K]) => setValues((current) => ({ ...current, [key]: value }));
  const steps = [t("بيانات الشركة", "Company"), t("الشعار", "Logo"), t("الإعداد المالي", "Financial"), t("حساب المدير", "Administrator"), t("المراجعة", "Review")];
  const companyValid = values.code.trim().length >= 2 && values.name.trim().length >= 2 && values.nameEn.trim().length >= 2 && values.taxNumber.trim().length >= 3 && values.phone.trim().length >= 7 && values.email.includes("@");
  const adminValid = values.adminFullName.trim().length >= 2 && values.username.trim().length >= 3 && validatePrototypePassword(values.password) && values.password === confirmPassword;
  const valid = step === 0 ? companyValid : step === 3 ? adminValid : true;

  const chooseLogo = (file?: File) => {
    setLogoError("");
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setLogoError(t("استخدم PNG أو JPG أو WEBP فقط.", "Use PNG, JPG, or WEBP only.")); return; }
    if (file.size > 400 * 1024) { setLogoError(t("حجم الشعار يجب ألا يتجاوز 400 كيلوبايت.", "Logo must not exceed 400 KB.")); return; }
    const reader = new FileReader();
    reader.onload = () => setValues((current) => ({ ...current, logoMetadata: file.name, logoDataUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const finish = async () => { setBusy(true); try { await onComplete(values); } finally { setBusy(false); } };

  return <div className="auth-screen setup-auth" dir={language === "ar" ? "rtl" : "ltr"}>
    <section className="auth-panel setup-panel">
      <button className="auth-language" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={17}/>{language === "ar" ? "English" : "العربية"}</button>
      <div className="auth-card setup-card">
        <div className="setup-brand"><CompanyLogo company={values}/><div><span>{t("تهيئة النظام", "SYSTEM SETUP")}</span><h1>{branding.productName}</h1><p>{t(branding.taglineArabic, branding.tagline)}</p></div></div>
        {existingCompany && <div className="migration-notice"><LockKeyhole size={18}/><div><strong>{t("استكمال إعداد البيانات الحالية", "Complete existing setup")}</strong><span>{t("لن يتم حذف أو استبدال أي بيانات محفوظة.", "No saved business data will be deleted or replaced.")}</span></div></div>}
        <div className="setup-progress">{steps.map((label, index) => <div className={index <= step ? "active" : ""} key={label}><i>{index < step ? <CheckCircle2 size={14}/> : index + 1}</i><span>{label}</span></div>)}</div>
        {step === 0 && <div className="form-grid"><SetupField label={t("كود الشركة", "Company code")}><input className="input" value={values.code} onChange={(e) => set("code", e.target.value)}/></SetupField><SetupField label={t("اسم الشركة بالعربية", "Arabic company name")}><input className="input" value={values.name} onChange={(e) => set("name", e.target.value)}/></SetupField><SetupField label={t("اسم الشركة بالإنجليزية", "English company name")}><input className="input" dir="ltr" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)}/></SetupField><SetupField label={t("السجل التجاري", "Commercial registration")}><input className="input" value={values.commercialRegistration} onChange={(e) => set("commercialRegistration", e.target.value)}/></SetupField><SetupField label={t("الرقم الضريبي", "Tax number")}><input className="input" value={values.taxNumber} onChange={(e) => set("taxNumber", e.target.value)}/></SetupField><SetupField label={t("الدولة", "Country")}><input className="input" value={values.country} onChange={(e) => set("country", e.target.value)}/></SetupField><SetupField label={t("العنوان", "Address")}><input className="input" value={values.address} onChange={(e) => set("address", e.target.value)}/></SetupField><SetupField label={t("الهاتف", "Phone")}><input className="input" dir="ltr" value={values.phone} onChange={(e) => set("phone", e.target.value)}/></SetupField><SetupField label={t("البريد الإلكتروني", "Email")}><input className="input" dir="ltr" type="email" value={values.email} onChange={(e) => set("email", e.target.value)}/></SetupField></div>}
        {step === 1 && <div className="logo-step"><ImageUp size={42}/><h2>{t("شعار الشركة", "Company logo")}</h2><p>{t("PNG أو JPG أو WEBP، بحد أقصى 400 كيلوبايت. يمكنك تخطي هذه الخطوة.", "PNG, JPG, or WEBP, up to 400 KB. You may skip this step.")}</p><CompanyLogo company={values} large/><button className="btn btn-secondary" onClick={() => fileRef.current?.click()}><ImageUp size={16}/>{t("اختيار الشعار", "Choose logo")}</button><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => chooseLogo(e.target.files?.[0])}/>{logoError && <span className="form-error">{logoError}</span>}</div>}
        {step === 2 && <div className="form-grid"><SetupField label={t("العملة", "Currency")}><select className="input" value={values.currency} onChange={(e) => set("currency", e.target.value)}><option>EGP</option><option>USD</option><option>SAR</option><option>AED</option></select></SetupField><SetupField label={t("بداية السنة المالية", "Fiscal year start")}><select className="input" value={values.fiscalYearStartMonth} onChange={(e) => set("fiscalYearStartMonth", Number(e.target.value))}>{Array.from({length:12},(_,index)=><option key={index + 1} value={index + 1}>{index + 1}</option>)}</select></SetupField><SetupField label={t("ضريبة القيمة المضافة الافتراضية %", "Default VAT %")}><input className="input" type="number" value={values.defaultTaxRate} onChange={(e) => set("defaultTaxRate", Number(e.target.value))}/></SetupField><SetupField label={t("نسبة الاحتجاز الافتراضية %", "Default retention %")}><input className="input" type="number" value={values.defaultRetentionRate} onChange={(e) => set("defaultRetentionRate", Number(e.target.value))}/></SetupField></div>}
        {step === 3 && <div className="form-grid"><div className="setup-icon-heading"><UserRound/><div><h2>{t("إنشاء مدير النظام", "Create administrator")}</h2><p>{t("سيُحفظ مشتق مشفّر من كلمة المرور محليًا، وليس كلمة المرور نفسها.", "A derived password hash is stored locally, never the password itself.")}</p></div></div><SetupField label={t("الاسم الكامل", "Full name")}><input className="input" autoComplete="name" value={values.adminFullName} onChange={(e) => set("adminFullName", e.target.value)}/></SetupField><SetupField label={t("اسم المستخدم", "Username")}><input className="input" dir="ltr" autoComplete="username" value={values.username} onChange={(e) => set("username", e.target.value)}/></SetupField><SetupField label={t("كلمة المرور", "Password")}><div className="password-field"><input className="input" dir="ltr" type={showPassword ? "text" : "password"} autoComplete="new-password" value={values.password} onChange={(e) => set("password", e.target.value)}/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></SetupField><SetupField label={t("تأكيد كلمة المرور", "Confirm password")}><input className="input" dir="ltr" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/></SetupField><p className="password-rule">{t("8 أحرف على الأقل، تتضمن حرفًا ورقمًا.", "At least 8 characters, including a letter and a number.")}</p></div>}
        {step === 4 && <div className="setup-review"><Settings2 size={42}/><h2>{t("راجع ثم أكمل الإعداد", "Review and finish")}</h2><dl><div><dt>{t("الشركة", "Company")}</dt><dd>{values.code} — {language === "ar" ? values.name : values.nameEn}</dd></div><div><dt>{t("العملة", "Currency")}</dt><dd>{values.currency}</dd></div><div><dt>{t("المدير", "Administrator")}</dt><dd>{values.adminFullName} · {values.username}</dd></div><div><dt>{t("بيانات الأعمال", "Business data")}</dt><dd>{t("ستبدأ فارغة بالكامل", "Starts completely empty")}</dd></div></dl></div>}
        <div className="setup-actions">{step > (existingCompany ? 3 : 0) && <button className="btn btn-secondary" disabled={busy} onClick={() => setStep(step - 1)}>{t("السابق", "Back")}</button>}<button className="btn btn-primary" disabled={!valid || busy} onClick={() => step === 4 ? finish() : setStep(step + 1)}>{step === 4 ? t("إنهاء والانتقال لتسجيل الدخول", "Finish and go to login") : t("التالي", "Next")}</button></div>
      </div>
    </section>
    <ConstructionVisual t={t}/>
  </div>;
}

function CompanyLogo({ company, large = false }: { company: Pick<CompanySetupInput, "logoDataUrl" | "name">; large?: boolean }) { return company.logoDataUrl ? <Image unoptimized width={large?94:48} height={large?94:48} className={`company-logo ${large ? "large" : ""}`} src={company.logoDataUrl} alt={company.name || "Company logo"}/> : <div className={`brand-mark ${large ? "large" : ""}`}><Building2/></div>; }

export function ConstructionVisual({ t }: { t: (ar: string, en: string) => string }) { return <section className="construction-visual" aria-label={t("مشهد هندسي لمشروع مقاولات", "Construction engineering visual")}><div className="visual-grid"/><div className="visual-sun"/><div className="crane"><i/><b/><span/></div><div className="building building-a">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><div className="building building-b">{Array.from({length:8},(_,i)=><i key={i}/>)}</div><div className="blueprint-lines"/><div className="visual-message"><HardHat/><span>{t("من الموقع إلى القوائم المالية", "From site operations to financial statements")}</span></div></section>; }

function SetupField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label>; }
