"use client";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ title, open, onClose, children, className = "" }: { title: string; open: boolean; onClose: () => void; children: ReactNode; className?: string }) {
  if (!open) return null;
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)onClose();}}><section className={`dialog ${className}`} role="dialog" aria-modal="true" aria-label={title}><div className="dialog-head"><h3>{title}</h3><button className="icon-button" aria-label="إغلاق" onClick={onClose}><X size={17}/></button></div>{children}</section></div>;
}
