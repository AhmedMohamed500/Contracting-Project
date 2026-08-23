"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode; resetKey: string; }
interface State { error?: Error; }

export class AccountingErrorBoundary extends Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") console.error(`[Accounting/${this.props.resetKey}] Failed to render`, error, info.componentStack);
  }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: undefined });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <div className="accounting-fallback" role="alert"><AlertTriangle/><strong>تعذر تحميل الصفحة</strong><p>حدث خطأ غير متوقع أثناء تجهيز بيانات الحسابات.</p><button className="btn btn-primary" onClick={() => this.setState({ error: undefined })}><RotateCcw size={16}/>إعادة المحاولة</button></div>;
  }
}
