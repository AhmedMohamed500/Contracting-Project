"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2, Eye, EyeOff, Languages, LockKeyhole, LogIn, UserRound } from "lucide-react";
import { branding } from "@/config/branding";
import { ConstructionVisual } from "@/components/setup-wizard";
import type { Company } from "@/types/erp";

export function LoginScreen({ company, onLogin }: { company: Company; onLogin: (username: string, password: string) => Promise<boolean> }) {
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = (ar: string, en: string) => language === "ar" ? ar : en;
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setBusy(true); setError(""); try { if (!await onLogin(username, password)) setError(t("اسم المستخدم أو كلمة المرور غير صحيحة", "Invalid username or password")); } finally { setBusy(false); } };
  return <div className="auth-screen" dir={language === "ar" ? "rtl" : "ltr"}>
    <section className="auth-panel">
      <button className="auth-language" onClick={() => setLanguage(language === "ar" ? "en" : "ar")}><Languages size={17}/>{language === "ar" ? "English" : "العربية"}</button>
      <form className="auth-card login-card" onSubmit={submit}>
        <div className="login-company-logo">{company.logoDataUrl ? <Image unoptimized width={74} height={74} src={company.logoDataUrl} alt={company.name}/> : <Building2/>}</div>
        <span className="login-overline">{t("مرحبًا بعودتك", "WELCOME BACK")}</span>
        <h1>{language === "ar" ? company.name : company.nameEn}</h1>
        <div className="login-product"><strong>{branding.productName}</strong><span>{t(branding.taglineArabic, branding.tagline)}</span></div>
        <label className="login-field"><span>{t("اسم المستخدم", "Username")}</span><div><UserRound/><input autoFocus dir="ltr" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)}/></div></label>
        <label className="login-field"><span>{t("كلمة المرور", "Password")}</span><div><LockKeyhole/><input dir="ltr" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)}/><button type="button" aria-label={t("إظهار أو إخفاء كلمة المرور", "Show or hide password")} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div></label>
        {error && <div className="login-error" role="alert">{error}</div>}
        <button className="btn btn-primary login-submit" disabled={busy || !username || !password}><LogIn size={17}/>{busy ? t("جارٍ التحقق...", "Signing in...") : t("دخول", "Sign in")}</button>
        <p className="prototype-security">{t("المصادقة الحالية نموذج محلي مؤقت ويجب استبدالها بمصادقة خادمية قبل الإنتاج.", "Current authentication is a local prototype and must be replaced by server-side authentication before production.")}</p>
      </form>
    </section>
    <ConstructionVisual t={t}/>
  </div>;
}
