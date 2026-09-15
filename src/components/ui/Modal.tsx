"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
export interface ModalProps { isOpen: boolean; onClose: () => void; children: ReactNode; title?: string; className?: string; }
export default function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  useEffect(() => { if (isOpen) document.body.style.overflow = "hidden"; else document.body.style.overflow = ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          {title && <h2 className="text-xl font-bold text-text">{title}</h2>}
          <button onClick={onClose} className="p-1 hover:bg-soft-blue rounded-lg transition-colors" aria-label="Close dialog"><X className="w-5 h-5" /></button>
        </div>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
}